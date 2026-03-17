import useSWR from 'swr'
import { useConfig } from './useConfig.jsx'

const fetcher = url => fetch(url).then(r => r.json())

export function useWeather() {
  const config = useConfig()
  const lat = config?.location?.latitude
  const lon = config?.location?.longitude
  const unit = config?.weather?.unit ?? 'celsius'
  const windUnit = config?.weather?.windUnit ?? 'mph'

  const windUnitParam = windUnit === 'mph' ? 'mph' : 'kmh'

  const url =
    lat && lon
      ? `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m,uv_index` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&wind_speed_unit=${windUnitParam}&temperature_unit=${unit}&timezone=auto&forecast_days=6`
      : null

  const { data, error, isLoading } = useSWR(url, fetcher, {
    refreshInterval: 10 * 60 * 1000, // 10 minutes
    revalidateOnFocus: false,
  })

  return { data, error, isLoading }
}
