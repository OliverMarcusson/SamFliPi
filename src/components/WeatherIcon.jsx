import React from 'react'
import {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle,
  CloudRain, CloudSnow, CloudLightning,
} from 'lucide-react'
import { getWeatherInfo } from '../utils/weatherCodes.js'

const ICON_MAP = {
  Sun, CloudSun, Cloud, CloudFog, CloudDrizzle,
  CloudRain, CloudSnow, CloudLightning,
}

export default function WeatherIcon({ code, size = 48, className = '' }) {
  const { icon: iconKey } = getWeatherInfo(code)
  const Icon = ICON_MAP[iconKey] ?? Cloud
  return <Icon size={size} strokeWidth={1.25} className={className} />
}
