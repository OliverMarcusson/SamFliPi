import React from 'react'
import { Cpu, Thermometer, MemoryStick, HardDrive } from 'lucide-react'
import Card from '../components/Card.jsx'
import { useSystemInfo } from '../hooks/useSystemInfo.js'

export default function SystemInfoWidget() {
  const { data, isLoading, error } = useSystemInfo()

  const metrics = [
    {
      label: 'CPU',
      icon: <Cpu size={13} />,
      value: data?.cpu_load != null ? `${Math.round(data.cpu_load)}%` : '—',
      pct: data?.cpu_load ?? 0,
      color: '#f87171',
    },
    {
      label: 'Temp',
      icon: <Thermometer size={13} />,
      value: data?.cpu_temp != null ? `${Math.round(data.cpu_temp)}°C` : '—',
      pct: data?.cpu_temp != null ? Math.min(data.cpu_temp / 85 * 100, 100) : 0,
      color: '#fb923c',
    },
    {
      label: 'RAM',
      icon: <MemoryStick size={13} />,
      value: data?.mem_pct != null ? `${Math.round(data.mem_pct)}%` : '—',
      pct: data?.mem_pct ?? 0,
      color: '#a78bfa',
    },
    {
      label: 'Disk',
      icon: <HardDrive size={13} />,
      value: data?.disk_pct != null ? `${Math.round(data.disk_pct)}%` : '—',
      pct: data?.disk_pct ?? 0,
      color: '#34d399',
    },
  ]

  return (
    <Card className="flex flex-col justify-center">
      <div className="grid grid-cols-4 gap-3">
        {metrics.map(m => (
          <MetricBar key={m.label} {...m} />
        ))}
      </div>
      {(error || (!isLoading && !data)) && (
        <div style={{ color: 'var(--label)', fontSize: '0.65rem', textAlign: 'center', marginTop: '0.5rem' }}>
          System stats unavailable
        </div>
      )}
    </Card>
  )
}

function MetricBar({ label, icon, value, pct, color }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <span style={{ color: 'var(--label)' }}>{icon}</span>
        <span style={{ color: 'var(--secondary)', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 500 }}>
          {label}
        </span>
      </div>
      <div style={{ color, fontSize: '1rem', fontFamily: 'JetBrains Mono, monospace', fontWeight: 400, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ height: 3, borderRadius: 2, background: 'var(--track-bg)', overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${Math.min(pct, 100)}%`,
            background: color,
            borderRadius: 2,
            transition: 'width 1s ease',
            opacity: 0.7,
          }}
        />
      </div>
    </div>
  )
}
