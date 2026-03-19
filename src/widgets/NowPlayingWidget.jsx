import React, { useEffect, useState } from 'react'
import { Music2, PauseCircle, PlayCircle } from 'lucide-react'
import Card from '../components/Card.jsx'
import { useNowPlaying } from '../hooks/useNowPlaying.js'

function formatDuration(ms) {
  if (typeof ms !== 'number' || ms < 0) {
    return '0:00'
  }

  const totalSeconds = Math.floor(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function getElapsedMs(state, nowMs) {
  if (!state.is_playing || !state.started_at || typeof state.duration_ms !== 'number') {
    return 0
  }

  const startedAtMs = Date.parse(state.started_at)
  if (Number.isNaN(startedAtMs)) {
    return 0
  }

  return Math.max(0, Math.min(nowMs - startedAtMs, state.duration_ms))
}

export default function NowPlayingWidget() {
  const { data, isLoading } = useNowPlaying()
  const [nowMs, setNowMs] = useState(() => Date.now())

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now())
    }, 1000)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [])

  const elapsedMs = getElapsedMs(data, nowMs)
  const progress = data.is_playing && data.duration_ms ? Math.min((elapsedMs / data.duration_ms) * 100, 100) : 0

  if (isLoading && !data.updated_at) {
    return (
      <Card className="flex flex-col py-4">
        <WidgetHeader isPlaying={false} />
        <div className="flex flex-1 items-center justify-center">
          <div style={{ color: 'var(--label)', fontSize: '1rem' }}>Loading now playing…</div>
        </div>
      </Card>
    )
  }

  if (!data.is_playing) {
    return (
      <Card className="flex flex-col py-4">
        <WidgetHeader isPlaying={false} />
        <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-3xl"
            style={{
              background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-now-playing) 22%, transparent), var(--inset-bg))',
              border: '1px solid var(--inset-border)',
              boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.18)',
            }}
          >
            <Music2 size={36} style={{ color: 'var(--accent-now-playing)' }} />
          </div>
          <div
            style={{
              color: 'var(--primary)',
              fontSize: '1.4rem',
              fontWeight: 700,
              lineHeight: 1.1,
            }}
          >
            Nothing is playing
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className="flex items-center gap-4 overflow-hidden py-5">
      <div
        className="flex h-full max-h-[8.5rem] w-32 shrink-0 items-center justify-center overflow-hidden rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, color-mix(in srgb, var(--accent-now-playing) 30%, transparent), var(--inset-bg))',
          border: '1px solid var(--inset-border)',
        }}
      >
        {data.cover_url ? (
          <img
            src={data.cover_url}
            alt={data.album ?? data.title ?? 'Album cover'}
            className="h-full w-full object-cover"
          />
        ) : (
          <Music2 size={40} style={{ color: 'var(--accent-now-playing-dim)' }} />
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-2">
        <WidgetHeader isPlaying />
        <div
          className="line-clamp-2"
          style={{
            color: 'var(--primary)',
            fontSize: '1.55rem',
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          {data.title}
        </div>
        <div
          className="line-clamp-2"
          style={{
            color: 'var(--accent-now-playing-dim)',
            fontSize: '1rem',
            fontWeight: 500,
            lineHeight: 1.2,
          }}
        >
          {data.artists.join(', ')}
        </div>
        <div
          className="truncate"
          style={{
            color: 'var(--secondary)',
            fontSize: '0.95rem',
          }}
        >
          {data.album}
        </div>

        <div className="mt-1 flex items-center gap-3">
          <span style={{ color: 'var(--secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
            {formatDuration(elapsedMs)}
          </span>
          <div className="flex-1 overflow-hidden rounded-full" style={{ height: 4, background: 'var(--track-bg)' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: 'var(--accent-now-playing)',
                boxShadow: '0 0 18px var(--accent-now-playing-track)',
                transition: 'width 1s linear',
              }}
            />
          </div>
          <span style={{ color: 'var(--secondary)', fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}>
            {formatDuration(data.duration_ms)}
          </span>
        </div>
      </div>
    </Card>
  )
}

function WidgetHeader({ isPlaying }) {
  return (
    <div className="flex items-center gap-2">
      <span
        style={{
          color: 'var(--label)',
          fontSize: '0.7rem',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          fontWeight: 600,
        }}
      >
        Now Playing
      </span>
      <span
        className="inline-flex items-center gap-1 rounded-full px-2 py-1"
        style={{
          background: 'var(--inset-bg)',
          border: '1px solid var(--inset-border)',
          color: isPlaying ? 'var(--accent-now-playing)' : 'var(--secondary)',
          fontSize: '0.75rem',
          lineHeight: 1,
        }}
      >
        {isPlaying ? <PlayCircle size={13} /> : <PauseCircle size={13} />}
        {isPlaying ? 'Live' : 'Stopped'}
      </span>
    </div>
  )
}
