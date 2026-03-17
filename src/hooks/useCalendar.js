import { useMemo } from 'react'
import { useConfig } from './useConfig.jsx'

export function useCalendar() {
  const config = useConfig()

  return useMemo(() => {
    if (!config?.events) return []

    const now = new Date()
    const weekOut = new Date(now)
    weekOut.setDate(weekOut.getDate() + 7)

    return config.events
      .filter(ev => {
        const d = new Date(ev.date + (ev.time ? `T${ev.time}` : 'T00:00'))
        return d >= now && d <= weekOut
      })
      .sort((a, b) => {
        const da = new Date(a.date + (a.time ? `T${a.time}` : 'T00:00'))
        const db = new Date(b.date + (b.time ? `T${b.time}` : 'T00:00'))
        return da - db
      })
  }, [config])
}
