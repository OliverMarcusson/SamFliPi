import useSWR from 'swr'
import { useConfig } from './useConfig.jsx'

const fetcher = url => fetch(url).then(r => r.json())

export function useNews() {
  const config = useConfig()
  const feedUrl = config?.news?.feedUrl

  const apiUrl = feedUrl
    ? `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feedUrl)}&count=10`
    : null

  const { data, error, isLoading } = useSWR(apiUrl, fetcher, {
    refreshInterval: 15 * 60 * 1000, // 15 minutes
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const items = data?.items ?? []

  return { items, error, isLoading }
}
