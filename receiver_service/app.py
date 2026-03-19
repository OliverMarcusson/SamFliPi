from __future__ import annotations

import logging

from .hooks import HookRegistry
from .state import JsonStateStore, normalize_now_playing_payload


class ReceiverApplication:
    def __init__(self, store: JsonStateStore, hooks: HookRegistry, logger: logging.Logger):
        self.store = store
        self.hooks = hooks
        self.logger = logger

    def initialize(self) -> None:
        current_state = self.store.initialize()
        self.hooks.initialize()
        self.hooks.run_all(current_state, current_state, self.logger)

    @property
    def is_ready(self) -> bool:
        return self.store.is_initialized and self.hooks.is_initialized

    def get_state(self) -> dict:
        return self.store.get_state()

    def ingest(self, payload: dict) -> dict:
        normalized_payload = normalize_now_playing_payload(payload)
        stored_state = self.store.persist(normalized_payload)
        self.hooks.run_all(normalized_payload, stored_state, self.logger)
        return stored_state
