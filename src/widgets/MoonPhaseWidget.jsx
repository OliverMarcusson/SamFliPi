import React from 'react'
import { ShieldAlert } from 'lucide-react'
import Card from '../components/Card.jsx'
import { useMoonPhase } from '../hooks/useMoonPhase.js'
import { useLatestCyberAnnouncement } from '../hooks/useLatestCyberAnnouncement.js'

export default function MoonPhaseWidget() {
  const moon = useMoonPhase()
  const { announcement, error, isLoading, isConfigured } = useLatestCyberAnnouncement()

  return (
    <div className="grid h-full grid-cols-3 gap-3">
      <Card className="col-span-1 flex h-full flex-col items-center justify-center gap-2 py-5">
        <div style={{ fontSize: '3.5rem', lineHeight: 1 }}>{moon.emoji}</div>
        <div style={{ color: 'var(--accent-moon)', fontSize: '0.85rem', fontWeight: 500, textAlign: 'center' }}>
          {moon.name}
        </div>
        <div style={{ color: 'var(--accent-moon-dim)', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
          {moon.illumination}% lit
        </div>
        <div style={{ color: 'var(--label)', fontSize: '0.65rem', textAlign: 'center' }}>
          Day {moon.dayInCycle} of 29.5
        </div>
      </Card>

      <Card className="col-span-2 flex h-full flex-col py-5">
        <div className="mb-2 flex items-center gap-2">
          <ShieldAlert size={14} style={{ color: '#f87171' }} />
          <span style={{ color: '#f87171', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Cyber
          </span>
          {announcement?.createdAt && (
            <span style={{ color: 'var(--label)', fontSize: '0.6rem', marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace' }}>
              {formatAnnouncementDate(announcement.createdAt)}
            </span>
          )}
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center">
          {isLoading && (
            <div style={{ color: 'var(--label)', fontSize: '0.85rem' }}>Loading announcement…</div>
          )}

          {!isLoading && !isConfigured && (
            <div style={{ color: 'var(--label)', fontSize: '0.85rem' }}>Announcement feed not configured</div>
          )}

          {!isLoading && isConfigured && error && (
            <div style={{ color: 'var(--label)', fontSize: '0.85rem' }}>Announcement unavailable</div>
          )}

          {!isLoading && isConfigured && !error && !announcement && (
            <div style={{ color: 'var(--label)', fontSize: '0.85rem' }}>No announcement published</div>
          )}

          {announcement && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div
                style={{
                  color: 'var(--primary)',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  lineHeight: 1.3,
                  marginBottom: '0.35rem',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {announcement.title}
              </div>

              <div
                style={{
                  color: 'var(--secondary)',
                  fontSize: '0.78rem',
                  fontWeight: 300,
                  lineHeight: 1.4,
                  display: '-webkit-box',
                  WebkitLineClamp: 4,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {announcement.body}
              </div>

              <div style={{ color: 'var(--label)', fontSize: '0.65rem', marginTop: 'auto', paddingTop: '0.75rem' }}>
                {announcement.author?.name ? `Posted by ${announcement.author.name}` : 'Cyber announcement board'}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}

function formatAnnouncementDate(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
