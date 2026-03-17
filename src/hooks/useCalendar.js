import useSWR from 'swr'
import { useMemo } from 'react'
import { useConfig } from './useConfig.jsx'

function formatLocalDate(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildUrl(config) {
  if (!config?.eventsApi?.url) return null

  const from = new Date()
  from.setHours(0, 0, 0, 0)

  const to = new Date(from)
  to.setDate(to.getDate() + 7)

  const params = new URLSearchParams({
    from: formatLocalDate(from),
    to: formatLocalDate(to),
    limit: '20',
  })

  return `/api/munin/events/upcoming?${params.toString()}`
}

function fetcher(url, token) {
  const headers = {
    Accept: 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  return fetch(url, { headers }).then(response => {
    if (!response.ok) throw new Error(String(response.status))
    return response.json()
  })
}

function getEventDate(event) {
  return new Date(event.date + (event.time ? `T${event.time}` : 'T00:00'))
}

export function useCalendar() {
  const config = useConfig()
  const url = buildUrl(config)

  const { data } = useSWR(
    url,
    requestUrl => fetcher(requestUrl),
    { refreshInterval: 60 * 1000, revalidateOnFocus: false },
  )

  return useMemo(() => {
    const raw = data?.events ?? config?.events ?? []

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    const weekOut = new Date(now)
    weekOut.setDate(weekOut.getDate() + 7)
    weekOut.setHours(23, 59, 59, 999)

    return raw
      .filter(ev => {
        const d = getEventDate(ev)
        return d >= now && d <= weekOut
      })
      .sort((a, b) => {
        const da = getEventDate(a)
        const db = getEventDate(b)
        return da - db
      })
  }, [config?.events, data?.events])
}
