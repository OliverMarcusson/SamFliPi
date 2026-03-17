import useSWR from 'swr'

const FALLBACK_QUOTES = [
  { q: 'The journey of a thousand miles begins with a single step.', a: 'Lao Tzu' },
  { q: 'In the middle of every difficulty lies opportunity.', a: 'Albert Einstein' },
  { q: 'It does not matter how slowly you go as long as you do not stop.', a: 'Confucius' },
  { q: 'Life is what happens when you\'re busy making other plans.', a: 'John Lennon' },
  { q: 'The only way to do great work is to love what you do.', a: 'Steve Jobs' },
]

const fetcher = url => fetch(url).then(r => r.json())

export function useQuote() {
  const { data, error } = useSWR(
    'https://zenquotes.io/api/today',
    fetcher,
    {
      refreshInterval: 24 * 60 * 60 * 1000, // 24 hours
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    }
  )

  if (error || !data || !Array.isArray(data) || !data[0]) {
    // Deterministic daily fallback based on day of year
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0)) / 86400000)
    const fallback = FALLBACK_QUOTES[dayOfYear % FALLBACK_QUOTES.length]
    return { quote: fallback.q, author: fallback.a, isLoading: false }
  }

  return { quote: data[0].q, author: data[0].a, isLoading: !data && !error }
}
