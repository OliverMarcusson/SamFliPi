import React from 'react'
import { Calendar } from 'lucide-react'
import Card from '../components/Card.jsx'
import { useCalendar } from '../hooks/useCalendar.js'

const COLOR_MAP = {
  blue:    { dot: '#93c5fd', bg: 'rgba(59,130,246,0.1)',   border: 'rgba(59,130,246,0.2)' },
  rose:    { dot: '#fda4af', bg: 'rgba(244,63,94,0.1)',    border: 'rgba(244,63,94,0.2)' },
  emerald: { dot: '#6ee7b7', bg: 'rgba(16,185,129,0.1)',   border: 'rgba(16,185,129,0.2)' },
  amber:   { dot: '#fcd34d', bg: 'rgba(245,158,11,0.1)',   border: 'rgba(245,158,11,0.2)' },
  violet:  { dot: '#c4b5fd', bg: 'rgba(139,92,246,0.1)',   border: 'rgba(139,92,246,0.2)' },
  default: { dot: '#8888aa', bg: 'rgba(136,136,170,0.1)',  border: 'rgba(136,136,170,0.2)' },
}

function getColorStyles(color) {
  return COLOR_MAP[color] ?? COLOR_MAP.default
}

export default function CalendarWidget() {
  const events = useCalendar()

  const grouped = events.reduce((acc, ev) => {
    const key = ev.date
    if (!acc[key]) acc[key] = []
    acc[key].push(ev)
    return acc
  }, {})

  const sortedDates = Object.keys(grouped).sort()

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <Calendar size={15} style={{ color: 'var(--accent-calendar)' }} />
        <span style={{ color: 'var(--accent-calendar)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          Upcoming
        </span>
      </div>

      {sortedDates.length === 0 ? (
        <div style={{ color: 'var(--label)', fontSize: '0.9rem', textAlign: 'center', paddingBlock: '1rem' }}>
          No events this week
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {sortedDates.map(date => {
            const label = getDayLabel(date)
            return (
              <div key={date}>
                <div style={{ color: 'var(--label)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.4rem' }}>
                  {label}
                </div>
                <div className="flex flex-col gap-2">
                  {grouped[date].map((ev, i) => {
                    const cs = getColorStyles(ev.color)
                    return (
                      <div
                        key={ev.id ?? `${ev.date}-${ev.time ?? 'all-day'}-${ev.title}-${i}`}
                        className="flex items-center gap-3 rounded-xl px-3 py-2"
                        style={{ background: cs.bg, border: `1px solid ${cs.border}` }}
                      >
                        <div style={{ width: 6, height: 6, borderRadius: '50%', background: cs.dot, flexShrink: 0 }} />
                        <div className="flex-1 min-w-0">
                          <div style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {ev.title}
                          </div>
                        </div>
                        {!ev.allDay && ev.time && (
                          <div style={{ color: 'var(--secondary)', fontSize: '0.78rem', fontFamily: 'JetBrains Mono, monospace', flexShrink: 0 }}>
                            {ev.time}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

function getDayLabel(isoDate) {
  const d = new Date(isoDate + 'T00:00:00')
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (d.toDateString() === today.toDateString()) return 'Today'
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow'
  return d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })
}
