# Events API Endpoint Design

Replaces (or supplements) the static `config.json` events array with a live API call, so calendar entries can be managed without touching the Pi.

---

## Endpoint

```
GET /api/events/upcoming
```

---

## Query Parameters

| Parameter | Type   | Default        | Description |
|-----------|--------|----------------|-------------|
| `from`    | date   | today (00:00)  | ISO 8601 date — inclusive lower bound |
| `to`      | date   | +7 days (23:59)| ISO 8601 date — inclusive upper bound |
| `limit`   | int    | 20             | Max events returned |

**Example:**
```
GET /api/events/upcoming?from=2026-03-17&to=2026-03-24
```

---

## Response

**`200 OK`**

```json
{
  "events": [
    {
      "id":    "evt_abc123",
      "title": "Team Meeting",
      "date":  "2026-03-18",
      "time":  "10:00",
      "color": "blue",
      "allDay": false
    },
    {
      "id":    "evt_def456",
      "title": "Bank Holiday",
      "date":  "2026-03-22",
      "time":  null,
      "color": "emerald",
      "allDay": true
    }
  ],
  "from": "2026-03-17",
  "to":   "2026-03-24"
}
```

### Event fields

| Field    | Type            | Required | Description |
|----------|-----------------|----------|-------------|
| `id`     | string          | yes      | Stable unique ID |
| `title`  | string          | yes      | Display name |
| `date`   | `YYYY-MM-DD`    | yes      | Local date |
| `time`   | `HH:MM` / null  | yes      | null if all-day |
| `color`  | string          | yes      | `blue` `rose` `emerald` `amber` `violet` |
| `allDay` | boolean         | yes      | Drives time display in the widget |

**`400 Bad Request`** — invalid `from`/`to` format
**`401 Unauthorized`** — missing/invalid token (if auth is enabled)
**`500 Internal Server Error`**

---

## Auth

The dashboard runs on a local network, so a simple static bearer token is sufficient:

```
Authorization: Bearer <token>
```

Add the token to `config.json` and read it in `useCalendar.js`:

```json
"eventsApi": {
  "url": "https://your-api.example.com/api/events/upcoming",
  "token": "your-secret-token"
}
```

---

## Frontend Integration

Update `useCalendar.js` to prefer the API when `config.eventsApi` is present, falling back to `config.events` if the fetch fails:

```js
// src/hooks/useCalendar.js
import useSWR from 'swr'
import { useMemo } from 'react'
import { useConfig } from './useConfig.jsx'

function buildUrl(config) {
  if (!config?.eventsApi?.url) return null
  const from = new Date().toISOString().slice(0, 10)
  const to   = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10)
  return `${config.eventsApi.url}?from=${from}&to=${to}`
}

function fetcher(url, token) {
  return fetch(url, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then(r => {
    if (!r.ok) throw new Error(r.status)
    return r.json()
  })
}

export function useCalendar() {
  const config = useConfig()
  const url    = buildUrl(config)
  const token  = config?.eventsApi?.token

  const { data } = useSWR(
    url ? [url, token] : null,
    ([u, t]) => fetcher(u, t),
    { refreshInterval: 5 * 60 * 1000, revalidateOnFocus: false }
  )

  // API result or static fallback
  const raw = data?.events ?? config?.events ?? []

  return useMemo(() => {
    const now     = new Date()
    const weekOut = new Date(now.getTime() + 7 * 86400000)

    return raw
      .filter(ev => {
        const d = new Date(ev.date + (ev.time ? `T${ev.time}` : 'T00:00'))
        return d >= now && d <= weekOut
      })
      .sort((a, b) => {
        const da = new Date(a.date + (a.time ? `T${a.time}` : 'T00:00'))
        const db = new Date(b.date + (b.time ? `T${b.time}` : 'T00:00'))
        return da - db
      })
  }, [raw])
}
```

When `eventsApi.url` is absent the hook behaves exactly as before.

---

## Allowed `color` Values

Match the palette already defined in `CalendarWidget.jsx`:

| Value     | Use for               |
|-----------|-----------------------|
| `blue`    | Work / meetings       |
| `rose`    | Health / personal     |
| `emerald` | Social / green events |
| `amber`   | Reminders / deadlines |
| `violet`  | Misc / fun            |

Unrecognised values fall back to the grey default.
