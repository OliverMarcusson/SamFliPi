from __future__ import annotations

import json
import logging
import os
import tempfile
import unittest
from pathlib import Path

from receiver_service import HookRegistry, JsonStateStore, ReceiverApplication, WebappStatePublisher
from receiver_service.state import SHARED_FILE_MODE, ValidationError, normalize_now_playing_payload


TRACK_STARTED_PAYLOAD = {
    "event": "track_started",
    "source": "raspotify-pi",
    "sent_at": "2026-03-19T12:34:56Z",
    "track_id": "spotify_track_id",
    "spotify_uri": "spotify:track:123",
    "title": "Song Title",
    "artists": ["Artist 1", "Artist 2"],
    "album": "Album Name",
    "cover_url": "https://i.scdn.co/image/example",
    "duration_ms": 210000,
    "started_at": "2026-03-19T12:34:52Z",
}


def always_fail_hook(normalized: dict, stored: dict) -> None:
    raise RuntimeError("boom")


class ReceiverServiceTests(unittest.TestCase):
    def test_normalize_track_started_payload(self) -> None:
        normalized = normalize_now_playing_payload(TRACK_STARTED_PAYLOAD, accepted_at="2026-03-19T12:35:00Z")
        self.assertTrue(normalized["is_playing"])
        self.assertEqual(normalized["artists"], ["Artist 1", "Artist 2"])
        self.assertEqual(normalized["updated_at"], "2026-03-19T12:35:00Z")

    def test_invalid_payload_raises_validation_error(self) -> None:
        with self.assertRaises(ValidationError):
            normalize_now_playing_payload({"event": "track_started"})

    def test_hook_failure_does_not_roll_back_state(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            store = JsonStateStore(temp_path / "state.json")
            hooks = HookRegistry()
            hooks.register("publisher", WebappStatePublisher(temp_path / "webapp.json"))
            hooks.register("failing_hook", always_fail_hook)

            app = ReceiverApplication(store=store, hooks=hooks, logger=logging.getLogger("test"))
            app.initialize()
            stored_state = app.ingest(TRACK_STARTED_PAYLOAD)

            self.assertEqual(stored_state["title"], "Song Title")
            self.assertEqual(app.get_state()["track_id"], "spotify_track_id")
            published = json.loads((temp_path / "webapp.json").read_text(encoding="utf-8"))
            self.assertEqual(published["track_id"], "spotify_track_id")

    def test_startup_restores_state_and_publishes_webapp_snapshot(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            store = JsonStateStore(temp_path / "state.json")
            hooks = HookRegistry()
            hooks.register("publisher", WebappStatePublisher(temp_path / "webapp.json"))
            app = ReceiverApplication(store=store, hooks=hooks, logger=logging.getLogger("test"))
            app.initialize()
            app.ingest(TRACK_STARTED_PAYLOAD)

            restored_store = JsonStateStore(temp_path / "state.json")
            restored_hooks = HookRegistry()
            restored_hooks.register("publisher", WebappStatePublisher(temp_path / "webapp-restored.json"))
            restored_app = ReceiverApplication(
                store=restored_store,
                hooks=restored_hooks,
                logger=logging.getLogger("test"),
            )
            restored_app.initialize()

            restored = json.loads((temp_path / "webapp-restored.json").read_text(encoding="utf-8"))
            self.assertEqual(restored["title"], "Song Title")
            self.assertTrue(restored["is_playing"])

    def test_application_ingest_persists_latest_state(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            store = JsonStateStore(temp_path / "state.json")
            hooks = HookRegistry()
            hooks.register("publisher", WebappStatePublisher(temp_path / "webapp.json"))
            app = ReceiverApplication(store=store, hooks=hooks, logger=logging.getLogger("test"))
            app.initialize()
            self.assertTrue(app.is_ready)

            stored_state = app.ingest(TRACK_STARTED_PAYLOAD)
            published_state = json.loads((temp_path / "webapp.json").read_text(encoding="utf-8"))

            self.assertEqual(stored_state["track_id"], "spotify_track_id")
            self.assertEqual(app.get_state()["title"], "Song Title")
            self.assertEqual(published_state["spotify_uri"], "spotify:track:123")

    def test_published_state_file_is_world_readable(self) -> None:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            store = JsonStateStore(temp_path / "state.json")
            hooks = HookRegistry()
            published_path = temp_path / "webapp.json"
            hooks.register("publisher", WebappStatePublisher(published_path))

            app = ReceiverApplication(store=store, hooks=hooks, logger=logging.getLogger("test"))
            app.initialize()
            app.ingest(TRACK_STARTED_PAYLOAD)

            mode = os.stat(published_path).st_mode & 0o777
            self.assertEqual(mode, SHARED_FILE_MODE)


if __name__ == "__main__":
    unittest.main()
