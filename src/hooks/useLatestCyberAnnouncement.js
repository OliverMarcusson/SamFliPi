import useSWR from 'swr'

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
    throw new Error(`Latest cyber announcement request failed with ${response.status}`)
  }

  const data = await response.json()
  return data.announcement ?? null
}

export function useLatestCyberAnnouncement() {
  const url = '/api/munin/cyber/announcements/latest'
  const isConfigured = true

  const { data, error, isLoading } = useSWR(
    url,
    requestUrl => fetcher(requestUrl),
    {
      refreshInterval: 60 * 1000,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  )

  return { announcement: data ?? null, error, isLoading, isConfigured }
}
