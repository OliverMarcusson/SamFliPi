import React from 'react'
import Card from '../components/Card.jsx'
import { useClock } from '../hooks/useClock.js'
import { useConfig } from '../hooks/useConfig.jsx'
import { formatDate } from '../utils/formatters.js'

export default function ClockWidget() {
  const now = useClock()
  const config = useConfig()
  const use24Hour = config?.display?.use24Hour ?? true
  const showSeconds = config?.display?.showSeconds ?? true

  const hours = now.getHours()
  const displayHours = use24Hour ? hours : (hours % 12 || 12)
  const hh = String(displayHours).padStart(2, '0')
  const mm = String(now.getMinutes()).padStart(2, '0')
  const ss = String(now.getSeconds()).padStart(2, '0')
  const ampm = !use24Hour ? (hours < 12 ? 'AM' : 'PM') : null

  return (
    <Card className="flex flex-col items-center justify-center">
      <div
        className="font-sans tracking-tighter leading-none select-none"
        style={{
          display: 'inline-flex',
          alignItems: 'baseline',
          justifyContent: 'center',
          fontSize: 'clamp(72px, 14vw, 120px)',
          fontWeight: 200,
          color: 'var(--accent-clock)',
          fontFamily: "'DM Sans', sans-serif",
          letterSpacing: '-0.04em',
          fontVariantNumeric: 'tabular-nums lining-nums',
        }}
      >
        <span>{hh}:{mm}</span>
        {showSeconds && (
          <span
            style={{
              display: 'inline-block',
              width: '2ch',
              textAlign: 'left',
              fontSize: '0.45em',
              fontWeight: 300,
              color: 'var(--accent-clock-dim)',
              marginLeft: '0.15em',
              verticalAlign: 'middle',
              fontVariantNumeric: 'tabular-nums lining-nums',
            }}
          >
            {ss}
          </span>
        )}
        {ampm && (
          <span
            style={{
              display: 'inline-block',
              width: '2.5ch',
              textAlign: 'left',
              fontSize: '0.3em',
              fontWeight: 300,
              color: 'var(--accent-clock-dim)',
              marginLeft: '0.2em',
            }}
          >
            {ampm}
          </span>
        )}
      </div>
      <div className="mt-2 font-sans" style={{ fontSize: '1.05rem', fontWeight: 300, color: 'var(--secondary)', letterSpacing: '0.04em' }}>
        {formatDate(now)}
      </div>
    </Card>
  )
}
