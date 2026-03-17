// WMO Weather interpretation codes
// https://open-meteo.com/en/docs#weathervariables

export const WMO_CODES = {
  0:  { description: 'Clear sky',                icon: 'Sun' },
  1:  { description: 'Mainly clear',             icon: 'Sun' },
  2:  { description: 'Partly cloudy',            icon: 'CloudSun' },
  3:  { description: 'Overcast',                 icon: 'Cloud' },
  45: { description: 'Foggy',                    icon: 'CloudFog' },
  48: { description: 'Icy fog',                  icon: 'CloudFog' },
  51: { description: 'Light drizzle',            icon: 'CloudDrizzle' },
  53: { description: 'Moderate drizzle',         icon: 'CloudDrizzle' },
  55: { description: 'Dense drizzle',            icon: 'CloudDrizzle' },
  56: { description: 'Freezing drizzle',         icon: 'CloudDrizzle' },
  57: { description: 'Heavy freezing drizzle',   icon: 'CloudDrizzle' },
  61: { description: 'Slight rain',              icon: 'CloudRain' },
  63: { description: 'Moderate rain',            icon: 'CloudRain' },
  65: { description: 'Heavy rain',               icon: 'CloudRain' },
  66: { description: 'Freezing rain',            icon: 'CloudRain' },
  67: { description: 'Heavy freezing rain',      icon: 'CloudRain' },
  71: { description: 'Slight snow',              icon: 'CloudSnow' },
  73: { description: 'Moderate snow',            icon: 'CloudSnow' },
  75: { description: 'Heavy snow',               icon: 'CloudSnow' },
  77: { description: 'Snow grains',              icon: 'CloudSnow' },
  80: { description: 'Slight showers',           icon: 'CloudRain' },
  81: { description: 'Moderate showers',         icon: 'CloudRain' },
  82: { description: 'Violent showers',          icon: 'CloudRain' },
  85: { description: 'Slight snow showers',      icon: 'CloudSnow' },
  86: { description: 'Heavy snow showers',       icon: 'CloudSnow' },
  95: { description: 'Thunderstorm',             icon: 'CloudLightning' },
  96: { description: 'Thunderstorm w/ hail',     icon: 'CloudLightning' },
  99: { description: 'Thunderstorm w/ heavy hail', icon: 'CloudLightning' },
}

export function getWeatherInfo(code) {
  return WMO_CODES[code] ?? { description: 'Unknown', icon: 'Cloud' }
}
