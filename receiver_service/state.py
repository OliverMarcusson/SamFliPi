from __future__ import annotations

import copy
import json
import os
import tempfile
import threading
from datetime import UTC, datetime
from pathlib import Path
from typing import Any


EMPTY_NOW_PLAYING_STATE = {
    "is_playing": False,
    "event": "stopped",
    "source": None,
    "track_id": None,
    "spotify_uri": None,
    "title": None,
    "artists": [],
    "album": None,
    "cover_url": None,
    "duration_ms": None,
    "started_at": None,
    "sent_at": None,
    "updated_at": None,
}

SHARED_FILE_MODE = 0o644


class ValidationError(ValueError):
    pass


def utc_now_iso() -> str:
    return datetime.now(tz=UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def parse_iso8601(value: Any, field_name: str) -> str:
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"{field_name} must be a non-empty ISO 8601 string")

    candidate = value.strip()
    try:
        parsed = datetime.fromisoformat(candidate.replace("Z", "+00:00"))
    except ValueError as exc:
        raise ValidationError(f"{field_name} must be a valid ISO 8601 timestamp") from exc

    if parsed.tzinfo is None:
        raise ValidationError(f"{field_name} must include a timezone")

    return parsed.astimezone(UTC).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def require_string(payload: dict[str, Any], field_name: str) -> str:
    value = payload.get(field_name)
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"{field_name} must be a non-empty string")
    return value.strip()


def require_artists(payload: dict[str, Any]) -> list[str]:
    artists = payload.get("artists")
    if not isinstance(artists, list) or not artists:
        raise ValidationError("artists must be a non-empty array of strings")

    normalized_artists: list[str] = []
    for artist in artists:
        if not isinstance(artist, str) or not artist.strip():
            raise ValidationError("artists must contain only non-empty strings")
        normalized_artists.append(artist.strip())
    return normalized_artists


def require_duration_ms(payload: dict[str, Any]) -> int:
    value = payload.get("duration_ms")
    if not isinstance(value, int) or value <= 0:
        raise ValidationError("duration_ms must be a positive integer")
    return value


def atomic_write_json(path: Path, payload: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    serialized = json.dumps(payload, ensure_ascii=True, indent=2, sort_keys=True)

    with tempfile.NamedTemporaryFile("w", encoding="utf-8", dir=path.parent, delete=False) as handle:
        handle.write(serialized)
        handle.write("\n")
        handle.flush()
        os.fsync(handle.fileno())
        temp_path = Path(handle.name)

    os.chmod(temp_path, SHARED_FILE_MODE)
    temp_path.replace(path)
    os.chmod(path, SHARED_FILE_MODE)


def normalize_now_playing_payload(payload: Any, *, accepted_at: str | None = None) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValidationError("payload must be a JSON object")

    event = require_string(payload, "event")
    if event not in {"track_started", "stopped"}:
        raise ValidationError("event must be one of: track_started, stopped")

    source = require_string(payload, "source")
    sent_at = parse_iso8601(payload.get("sent_at"), "sent_at")
    updated_at = accepted_at or utc_now_iso()

    if event == "stopped":
        return {
            **EMPTY_NOW_PLAYING_STATE,
            "event": "stopped",
            "source": source,
            "sent_at": sent_at,
            "updated_at": updated_at,
        }

    return {
        "is_playing": True,
        "event": "track_started",
        "source": source,
        "track_id": require_string(payload, "track_id"),
        "spotify_uri": require_string(payload, "spotify_uri"),
        "title": require_string(payload, "title"),
        "artists": require_artists(payload),
        "album": require_string(payload, "album"),
        "cover_url": require_string(payload, "cover_url"),
        "duration_ms": require_duration_ms(payload),
        "started_at": parse_iso8601(payload.get("started_at"), "started_at"),
        "sent_at": sent_at,
        "updated_at": updated_at,
    }


class JsonStateStore:
    def __init__(self, path: str | Path):
        self.path = Path(path)
        self._lock = threading.RLock()
        self._state = copy.deepcopy(EMPTY_NOW_PLAYING_STATE)
        self._initialized = False

    def initialize(self) -> dict[str, Any]:
        with self._lock:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            if self.path.exists():
                with self.path.open("r", encoding="utf-8") as handle:
                    loaded = json.load(handle)
                self._state = self._normalize_loaded_state(loaded)
            else:
                atomic_write_json(self.path, self._state)

            self._initialized = True
            return copy.deepcopy(self._state)

    def get_state(self) -> dict[str, Any]:
        with self._lock:
            return copy.deepcopy(self._state)

    def persist(self, state: dict[str, Any]) -> dict[str, Any]:
        with self._lock:
            atomic_write_json(self.path, state)
            self._state = copy.deepcopy(state)
            return copy.deepcopy(self._state)

    @property
    def is_initialized(self) -> bool:
        return self._initialized

    def _normalize_loaded_state(self, loaded: Any) -> dict[str, Any]:
        if not isinstance(loaded, dict):
            return copy.deepcopy(EMPTY_NOW_PLAYING_STATE)

        state = copy.deepcopy(EMPTY_NOW_PLAYING_STATE)
        for key in state:
            if key == "artists":
                artists = loaded.get("artists")
                state["artists"] = artists if isinstance(artists, list) else []
                continue
            state[key] = loaded.get(key)

        return state
