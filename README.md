# SamFlip

<p align="center">
  <img src="./SamFliPi.png" alt="SamFlip banner" width="960" />
</p>

SamFlip is a Raspberry Pi-friendly wall dashboard built with React and Vite. It combines weather, forecasts, calendar events, countdowns, cyber announcements, quotes, now playing status, and system metrics into a single full-screen display.

## Overview

The project is split into three runtime pieces:

- `samflip`: the frontend, built with Vite and served by Nginx
- `samflip_monitor`: a lightweight sidecar that writes CPU, temperature, memory, and disk data to `/system/system.json`
- `samflip_now_playing_receiver`: a Python service that accepts now-playing updates and publishes shared state for the dashboard

At runtime, the dashboard reads:

- `config.json` for location, display, and calendar configuration
- `/system.json` for system metrics
- `/api/now-playing` for the latest playback state
- proxied Munin endpoints for events, cyber announcements, and quotes
- Open-Meteo for weather and forecast data

## Features

- Full-screen dashboard layout designed for a 1920px display
- Clock, weather, multi-day forecast, and countdown widgets
- Upcoming events pulled from Munin with local fallback data
- Cyber announcement and random quote widgets
- Push-based now playing integration for a separate Spotify/raspotify sender
- Host system metrics gathered from the Pi through a shared volume

## Configuration

The dashboard loads [config.json](./config.json) at runtime. The current config shape includes:

- `location`: latitude, longitude, and label used for weather queries
- `weather`: temperature and wind units
- `news`: RSS feed URL
- `eventsApi`: upstream events endpoint
- `events`: local fallback events
- `countdowns`: named future dates shown in the UI
- `display`: 24-hour and seconds display settings

Environment variables are defined in [.env.example](./.env.example):

- `EVENTS_API_SECRET`: bearer token used for the proxied Munin endpoints
- `MUNIN_BASE_URL`: base URL for the Munin backend

For local frontend development, Vite also supports:

- `NOW_PLAYING_RECEIVER_URL`: defaults to `http://localhost:8787`

## Running With Docker Compose

The default deployment path is [docker-compose.yml](./docker-compose.yml).

```bash
cp .env.example .env
docker compose up --build
```

This starts:

- the frontend on `http://localhost:3000`
- the now-playing receiver on `http://localhost:8787`
- the monitor sidecar that writes shared system metrics

The compose stack mounts [config.json](./config.json) into the frontend container and shares volumes between the frontend, monitor, and receiver so live JSON state can be served directly by Nginx.

## Local Development

Frontend:

```bash
bun install
bun run dev
```

The Vite dev server runs on `http://localhost:5173`.

Receiver service:

```bash
python -m receiver_service
```

Useful receiver environment variables:

- `NOW_PLAYING_HOST`
- `NOW_PLAYING_PORT`
- `NOW_PLAYING_STATE_PATH`
- `NOW_PLAYING_WEBAPP_STATE_PATH`
- `NOW_PLAYING_LOG_LEVEL`

## Now Playing Receiver API

The receiver service exposes:

- `POST /ingest/now-playing`
- `GET /api/now-playing`
- `GET /healthz`
- `GET /readyz`

Incoming payloads are normalized, persisted, and then written to the shared webapp JSON file by the hook registered in [receiver_service/__main__.py](./receiver_service/__main__.py). The detailed design notes live in [NowPlaying.md](./NowPlaying.md).

## Testing

Receiver tests are in [tests/test_receiver_service.py](./tests/test_receiver_service.py).

```bash
python -m unittest discover -s tests
```

## Project Structure

```text
.
├── src/                    # React app, widgets, hooks, and styling
├── receiver_service/       # Python now-playing receiver and hook pipeline
├── monitor/                # Host metrics collector script
├── receiver/               # Dockerfile for the receiver service
├── config.json             # Runtime dashboard config
├── docker-compose.yml      # Full multi-service deployment
└── SamFliPi.png            # README banner asset
```
