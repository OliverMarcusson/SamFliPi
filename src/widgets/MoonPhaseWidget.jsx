import React from 'react'
import Card from '../components/Card.jsx'
import { useMoonPhase } from '../hooks/useMoonPhase.js'
import { useConfig } from '../hooks/useConfig.jsx'
import { daysUntil } from '../utils/formatters.js'

export default function MoonPhaseWidget() {
  const moon = useMoonPhase()
  const config = useConfig()
  const countdowns = config?.countdowns ?? []

  return (
    <div className="col-span-2 grid grid-cols-2 gap-3 h-full">
      {/* Moon */}
      <Card className="flex flex-col items-center justify-center gap-2 py-5">
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

      {/* Countdowns */}
      <Card className="flex flex-col justify-center gap-2 py-5">
        <div style={{ color: 'var(--label)', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.25rem' }}>
          Countdowns
        </div>
        {countdowns.length === 0 ? (
          <div style={{ color: 'var(--label)', fontSize: '0.85rem' }}>No countdowns</div>
        ) : (
          countdowns.slice(0, 3).map((cd, i) => {
            const days = daysUntil(cd.date)
            return (
              <div key={i} className="flex flex-col gap-0.5">
                <div style={{ color: 'var(--primary)', fontSize: '0.85rem', fontWeight: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {cd.label}
                </div>
                <div style={{ color: '#fbbf24', fontSize: '1.1rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 400 }}>
                  {days > 0 ? `${days}d` : days === 0 ? 'Today!' : 'Past'}
                </div>
              </div>
            )
          })
        )}
      </Card>
    </div>
  )
}
