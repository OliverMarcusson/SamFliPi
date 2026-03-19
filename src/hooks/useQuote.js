import { useEffect } from 'react'
import useSWR from 'swr'

const FALLBACK_QUOTES = [
  { q: 'The journey of a thousand miles begins with a single step.', a: 'Lao Tzu' },
  { q: 'In the middle of every difficulty lies opportunity.', a: 'Albert Einstein' },
  { q: 'It does not matter how slowly you go as long as you do not stop.', a: 'Confucius' },
  { q: 'Life is what happens when you\'re busy making other plans.', a: 'John Lennon' },
  { q: 'The only way to do great work is to love what you do.', a: 'Steve Jobs' },
]

async function fetcher(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (response.status === 404) {
    return null
  }

  if (!response.ok) {
    throw new Error(`Random quote request failed with ${response.status}`)
  }

  const data = await response.json()
  return data.quote ?? null
}

function getMsUntilNextFiveMinuteMark(now = new Date()) {
  const next = new Date(now)
  next.setSeconds(0, 0)
  const minutesToAdd = now.getMinutes() % 5 === 0 ? 5 : 5 - (now.getMinutes() % 5)
  next.setMinutes(now.getMinutes() + minutesToAdd)
  return next.getTime() - now.getTime()
}

export function useQuote() {
  const { data, error, isLoading, mutate } = useSWR(
    '/api/munin/cyber/quotes/random',
    requestUrl => fetcher(requestUrl),
    {
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  useEffect(() => {
    let timeoutId

    const scheduleNextRefresh = () => {
      timeoutId = window.setTimeout(() => {
        void mutate()
        scheduleNextRefresh()
      }, getMsUntilNextFiveMinuteMark())
    }

    scheduleNextRefresh()

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [mutate])

  if (isLoading) {
    return { quote: '', author: '', isLoading: true }
  }

  if (error || !data?.text) {
    // Deterministic daily fallback based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    const fallback = FALLBACK_QUOTES[dayOfYear % FALLBACK_QUOTES.length]
    return { quote: fallback.q, author: fallback.a, isLoading: false }
  }

  return {
    quote: data.text,
    author: data.source || data.author?.name || 'Unknown',
    isLoading: false,
  }
}
