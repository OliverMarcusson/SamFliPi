from __future__ import annotations

import logging
import os

from .app import ReceiverApplication
from .hooks import HookRegistry
from .server import create_server
from .state import JsonStateStore
from .webapp_hook import WebappStatePublisher


def configure_logging(level_name: str) -> logging.Logger:
    logging.basicConfig(
        level=getattr(logging, level_name.upper(), logging.INFO),
        format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
    )
    return logging.getLogger("receiver_service")


def main() -> None:
    host = os.environ.get("NOW_PLAYING_HOST", "0.0.0.0")
    port = int(os.environ.get("NOW_PLAYING_PORT", "8787"))
    state_path = os.environ.get("NOW_PLAYING_STATE_PATH", "/data/now-playing-state.json")
    webapp_state_path = os.environ.get("NOW_PLAYING_WEBAPP_STATE_PATH", "/shared/now-playing.json")
    logger = configure_logging(os.environ.get("NOW_PLAYING_LOG_LEVEL", "INFO"))

    store = JsonStateStore(state_path)
    hooks = HookRegistry()
    hooks.register("webapp_state_publisher", WebappStatePublisher(webapp_state_path))

    app = ReceiverApplication(store=store, hooks=hooks, logger=logger)
    app.initialize()

    server = create_server(host, port, app)
    logger.info("Now playing receiver listening on %s:%s", host, port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutdown requested")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
