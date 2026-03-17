import React, { useEffect } from 'react'
import { ConfigProvider } from './hooks/useConfig.jsx'
import ClockWidget from './widgets/ClockWidget.jsx'
import WeatherWidget from './widgets/WeatherWidget.jsx'
import ForecastWidget from './widgets/ForecastWidget.jsx'
import CalendarWidget from './widgets/CalendarWidget.jsx'
import MoonPhaseWidget from './widgets/MoonPhaseWidget.jsx'
import QuoteWidget from './widgets/QuoteWidget.jsx'
import NewsWidget from './widgets/NewsWidget.jsx'
import SystemInfoWidget from './widgets/SystemInfoWidget.jsx'

const theme = new URLSearchParams(window.location.search).get('theme') ?? 'dark'

// Flex grow values — proportional height allocation across the 1920px screen
const FLEX = {
  clock:    4,
  weather:  4.5,
  forecast: 2.5,
  calendar: 5,
  moon:     3.5,
  quote:    2.5,
  news:     3,
  system:   2,
}

export default function App() {
  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [])

  return (
    <ConfigProvider>
      <div
        className="flex flex-col gap-3 p-4 overflow-hidden"
        style={{ height: '100dvh', background: 'var(--bg)' }}
      >
        <div style={{ flex: FLEX.clock    }}><ClockWidget /></div>
        <div style={{ flex: FLEX.weather  }}><WeatherWidget /></div>
        <div style={{ flex: FLEX.forecast }}><ForecastWidget /></div>
        <div style={{ flex: FLEX.calendar }}><CalendarWidget /></div>
        <div style={{ flex: FLEX.moon    }}><MoonPhaseWidget /></div>
        <div style={{ flex: FLEX.quote   }}><QuoteWidget /></div>
        <div style={{ flex: FLEX.news    }}><NewsWidget /></div>
        <div style={{ flex: FLEX.system  }}><SystemInfoWidget /></div>
      </div>
    </ConfigProvider>
  )
}
