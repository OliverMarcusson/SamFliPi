import React from 'react'
import { Wind, Droplets, Sun } from 'lucide-react'
import Card from '../components/Card.jsx'
import WeatherIcon from '../components/WeatherIcon.jsx'
import { useWeather } from '../hooks/useWeather.js'
import { useConfig } from '../hooks/useConfig.jsx'
import { getWeatherInfo } from '../utils/weatherCodes.js'

export default function WeatherWidget() {
  const { data, isLoading, error } = useWeather()
  const config = useConfig()
  const unit = config?.weather?.unit ?? 'celsius'
  const windUnit = config?.weather?.windUnit ?? 'mph'
  const locationName = config?.location?.name ?? ''

  if (isLoading || !config) {
    return (
      <Card className="flex items-center justify-center py-8">
        <span style={{ color: 'var(--label)', fontSize: '0.9rem' }}>Loading weather…</span>
      </Card>
    )
  }

  if (error || !data?.current) {
    return (
      <Card className="flex items-center justify-center py-8">
        <span style={{ color: 'var(--secondary)', fontSize: '0.9rem' }}>Weather unavailable</span>
      </Card>
    )
  }

  const c = data.current
  const code = c.weather_code
  const { description } = getWeatherInfo(code)
  const tempSymbol = unit === 'celsius' ? '°C' : '°F'

  return (
    <Card className="flex flex-col justify-center">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <div style={{ color: 'var(--secondary)', fontSize: '0.75rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            {locationName}
          </div>
          <div className="font-sans leading-none" style={{ fontSize: 'clamp(52px, 10vw, 80px)', fontWeight: 200, color: 'var(--accent-weather)' }}>
            {Math.round(c.temperature_2m)}{tempSymbol}
          </div>
          <div style={{ color: 'var(--secondary)', fontSize: '1rem', fontWeight: 300 }}>{description}</div>
          <div style={{ color: 'var(--accent-clock-dim)', fontSize: '0.85rem', fontWeight: 300 }}>
            Feels like {Math.round(c.apparent_temperature)}{tempSymbol}
          </div>
        </div>
        <WeatherIcon code={code} size={72} className="opacity-80" style={{ color: 'var(--accent-weather)' }} />
      </div>

      <div className="grid grid-cols-3 gap-3 mt-4">
        <Stat icon={<Wind size={14} />} label="Wind" value={`${Math.round(c.wind_speed_10m)} ${windUnit}`} />
        <Stat icon={<Droplets size={14} />} label="Humidity" value={`${c.relative_humidity_2m}%`} />
        <Stat icon={<Sun size={14} />} label="UV Index" value={c.uv_index ?? '—'} />
      </div>
    </Card>
  )
}

function Stat({ icon, label, value }) {
  return (
    <div
      className="flex flex-col items-center gap-1 rounded-xl py-2"
      style={{ background: 'var(--inset-bg)', border: '1px solid var(--inset-border)' }}
    >
      <span style={{ color: 'var(--label)' }}>{icon}</span>
      <span style={{ color: 'var(--primary)', fontSize: '0.9rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 400 }}>
        {value}
      </span>
      <span style={{ color: 'var(--label)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </span>
    </div>
  )
}
