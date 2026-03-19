from __future__ import annotations

import logging
from dataclasses import dataclass
from time import perf_counter
from typing import Callable


HookCallback = Callable[[dict, dict], None]


@dataclass(frozen=True)
class RegisteredHook:
    name: str
    callback: HookCallback


class HookRegistry:
    def __init__(self) -> None:
        self._hooks: list[RegisteredHook] = []
        self._initialized = False

    def register(self, name: str, callback: HookCallback) -> None:
        self._hooks.append(RegisteredHook(name=name, callback=callback))

    def initialize(self) -> None:
        self._initialized = True

    def run_all(self, normalized_payload: dict, stored_state: dict, logger: logging.Logger) -> None:
        for hook in self._hooks:
            started_at = perf_counter()
            try:
                hook.callback(normalized_payload, stored_state)
            except Exception:
                duration_ms = (perf_counter() - started_at) * 1000
                logger.exception("Receiver hook failed", extra={"hook_name": hook.name, "duration_ms": round(duration_ms, 2)})
            else:
                duration_ms = (perf_counter() - started_at) * 1000
                logger.info(
                    "Receiver hook completed",
                    extra={"hook_name": hook.name, "duration_ms": round(duration_ms, 2)},
                )

    @property
    def is_initialized(self) -> bool:
        return self._initialized
