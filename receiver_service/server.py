from __future__ import annotations

import json
import logging
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import urlparse

from .app import ReceiverApplication
from .state import ValidationError


class ReceiverHttpServer(ThreadingHTTPServer):
    def __init__(self, server_address: tuple[str, int], app: ReceiverApplication):
        super().__init__(server_address, ReceiverRequestHandler)
        self.app = app


class ReceiverRequestHandler(BaseHTTPRequestHandler):
    server_version = "NowPlayingReceiver/1.0"

    def do_GET(self) -> None:
        path = urlparse(self.path).path
        if path == "/healthz":
            self._send_plaintext(HTTPStatus.OK, "ok\n")
            return

        if path == "/readyz":
            if self.server.app.is_ready:
                self._send_plaintext(HTTPStatus.OK, "ready\n")
            else:
                self._send_plaintext(HTTPStatus.SERVICE_UNAVAILABLE, "not ready\n")
            return

        if path == "/api/now-playing":
            self._send_json(HTTPStatus.OK, self.server.app.get_state())
            return

        self._send_json(HTTPStatus.NOT_FOUND, {"error": "not_found"})

    def do_POST(self) -> None:
        path = urlparse(self.path).path
        if path != "/ingest/now-playing":
            self._send_json(HTTPStatus.NOT_FOUND, {"error": "not_found"})
            return

        try:
            payload = self._read_json_body()
            self.server.app.ingest(payload)
        except ValidationError as exc:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "invalid_payload", "detail": str(exc)})
            return
        except json.JSONDecodeError:
            self._send_json(HTTPStatus.BAD_REQUEST, {"error": "invalid_json"})
            return
        except OSError as exc:
            self.log_error("Persistence failed: %s", exc)
            self._send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "persistence_failed"})
            return
        except Exception:
            self.log_exception("Unhandled ingest failure")
            self._send_json(HTTPStatus.INTERNAL_SERVER_ERROR, {"error": "internal_error"})
            return

        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Content-Length", "0")
        self.end_headers()

    def log_message(self, format: str, *args: Any) -> None:
        logging.getLogger("receiver_service.http").info("%s - %s", self.address_string(), format % args)

    def log_exception(self, message: str) -> None:
        logging.getLogger("receiver_service.http").exception(message)

    def _read_json_body(self) -> Any:
        content_length = self.headers.get("Content-Length")
        if content_length is None:
            raise ValidationError("Content-Length header is required")

        body_length = int(content_length)
        if body_length <= 0:
            raise ValidationError("request body must not be empty")
        if body_length > 65536:
            raise ValidationError("request body exceeds maximum size")

        raw_body = self.rfile.read(body_length)
        return json.loads(raw_body.decode("utf-8"))

    def _send_plaintext(self, status: HTTPStatus, body: str) -> None:
        encoded = body.encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)

    def _send_json(self, status: HTTPStatus, payload: dict[str, Any]) -> None:
        encoded = json.dumps(payload, ensure_ascii=True).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


def create_server(host: str, port: int, app: ReceiverApplication) -> ReceiverHttpServer:
    return ReceiverHttpServer((host, port), app)
