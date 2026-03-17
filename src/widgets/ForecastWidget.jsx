import React from 'react'
import Card from '../components/Card.jsx'
import WeatherIcon from '../components/WeatherIcon.jsx'
import { useWeather } from '../hooks/useWeather.js'
import { useConfig } from '../hooks/useConfig.jsx'
import { formatDay } from '../utils/formatters.js'

export default function ForecastWidget() {
  const { data, isLoading } = useWeather()
  const config = useConfig()
  const unit = config?.weather?.unit ?? 'celsius'
  const tempSymbol = unit === 'celsius' ? '°' : '°'

  if (isLoading || !data?.daily) {
    return (
      <Card className="flex items-center justify-center py-4">
        <span style={{ color: 'var(--label)', fontSize: '0.9rem' }}>Loading forecast…</span>
      </Card>
    )
  }

  const daily = data.daily
  const days = daily.time.slice(1, 6)

  return (
    <Card className="flex flex-col justify-center">
      <div className="flex gap-2">
        {days.map((date, i) => {
          const code = daily.weather_code[i + 1]
          const hi = Math.round(daily.temperature_2m_max[i + 1])
          const lo = Math.round(daily.temperature_2m_min[i + 1])
          const precip = daily.precipitation_probability_max[i + 1]

          return (
            <div
              key={date}
              className="flex-1 flex flex-col items-center gap-1 rounded-xl py-3"
              style={{ background: 'var(--inset-bg)', border: '1px solid var(--inset-border)' }}
            >
              <span style={{ color: 'var(--secondary)', fontSize: '0.7rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {formatDay(date)}
              </span>
              <WeatherIcon code={code} size={24} className="opacity-70 my-1" style={{ color: 'var(--accent-weather)' }} />
              <span style={{ color: 'var(--primary)', fontSize: '0.85rem', fontFamily: 'JetBrains Mono, monospace' }}>
                {hi}{tempSymbol}
              </span>
              <span style={{ color: 'var(--label)', fontSize: '0.75rem', fontFamily: 'JetBrains Mono, monospace' }}>
                {lo}{tempSymbol}
              </span>
              {precip > 0 && (
                <span style={{ color: 'var(--accent-weather)', fontSize: '0.65rem', opacity: 0.7 }}>
                  {precip}%
                </span>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
