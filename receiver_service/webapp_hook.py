from __future__ import annotations

from pathlib import Path

from .state import atomic_write_json


class WebappStatePublisher:
    def __init__(self, path: str | Path):
        self.path = Path(path)

    def __call__(self, normalized_payload: dict, stored_state: dict) -> None:
        atomic_write_json(self.path, stored_state)
