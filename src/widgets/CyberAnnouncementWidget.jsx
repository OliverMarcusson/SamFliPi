import React from 'react'
import { ShieldAlert } from 'lucide-react'
import Card from '../components/Card.jsx'
import { useLatestCyberAnnouncement } from '../hooks/useLatestCyberAnnouncement.js'

export default function CyberAnnouncementWidget() {
  const { announcement, error, isLoading, isConfigured } = useLatestCyberAnnouncement()

  return (
    <Card className="flex h-full flex-col py-5">
      <div className="mb-2 flex items-center gap-2">
        <ShieldAlert size={14} style={{ color: '#f87171' }} />
        <span style={{ color: '#f87171', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Cyber
        </span>
        {announcement?.createdAt && (
          <span style={{ color: 'var(--label)', fontSize: '0.7rem', marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace' }}>
            {formatAnnouncementDate(announcement.createdAt)}
          </span>
        )}
      </div>

      <div className="flex min-h-0 flex-1 flex-col justify-center">
        {isLoading && (
          <div style={{ color: 'var(--label)', fontSize: '0.95rem' }}>Loading announcement…</div>
        )}

        {!isLoading && !isConfigured && (
          <div style={{ color: 'var(--label)', fontSize: '0.95rem' }}>Announcement feed not configured</div>
        )}

        {!isLoading && isConfigured && error && (
          <div style={{ color: 'var(--label)', fontSize: '0.95rem' }}>Announcement unavailable</div>
        )}

        {!isLoading && isConfigured && !error && !announcement && (
          <div style={{ color: 'var(--label)', fontSize: '0.95rem' }}>No announcement published</div>
        )}

        {announcement && (
          <div className="flex min-h-0 flex-1 flex-col">
            <div
              style={{
                color: 'var(--primary)',
                fontSize: '1.02rem',
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
                fontSize: '0.88rem',
                fontWeight: 400,
                lineHeight: 1.45,
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {announcement.body}
            </div>

            <div style={{ color: 'var(--label)', fontSize: '0.75rem', marginTop: 'auto', paddingTop: '0.65rem' }}>
              {announcement.author?.name ? `Posted by ${announcement.author.name}` : 'Cyber announcement board'}
            </div>
          </div>
        )}
      </div>
    </Card>
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
