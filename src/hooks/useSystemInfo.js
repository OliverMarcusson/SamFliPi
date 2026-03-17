import useSWR from 'swr'

const fetcher = url => fetch(url).then(r => r.json())

export function useSystemInfo() {
  const { data, error, isLoading } = useSWR('/system.json', fetcher, {
    refreshInterval: 5000, // 5 seconds
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  return { data, error, isLoading }
}
