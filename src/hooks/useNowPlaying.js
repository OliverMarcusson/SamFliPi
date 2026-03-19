import useSWR from 'swr'

const EMPTY_STATE = {
  is_playing: false,
  event: 'stopped',
  source: null,
  track_id: null,
  spotify_uri: null,
  title: null,
  artists: [],
  album: null,
  cover_url: null,
  duration_ms: null,
  started_at: null,
  sent_at: null,
  updated_at: null,
}

async function fetcher(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
  })

  if (response.status === 404) {
    return EMPTY_STATE
  }

  if (!response.ok) {
    throw new Error(`Now playing request failed with ${response.status}`)
  }

  const data = await response.json()

  return {
    ...EMPTY_STATE,
    ...data,
    artists: Array.isArray(data.artists) ? data.artists : [],
  }
}

export function useNowPlaying() {
  const { data, error, isLoading } = useSWR('/api/now-playing', fetcher, {
    fallbackData: EMPTY_STATE,
    refreshInterval: 2000,
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  return {
    data: data ?? EMPTY_STATE,
    error,
    isLoading,
  }
}
