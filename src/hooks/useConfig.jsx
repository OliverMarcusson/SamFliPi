import React, { createContext, useContext, useEffect, useState } from 'react'

const ConfigContext = createContext(null)

export function ConfigProvider({ children }) {
  const [config, setConfig] = useState(null)

  useEffect(() => {
    fetch('/config.json')
      .then(r => r.json())
      .then(setConfig)
      .catch(err => {
        console.error('Failed to load config.json:', err)
        // Minimal fallback
        setConfig({
          location: { latitude: 59.6361, longitude: 17.0777, name: 'Enköping, Sweden' },
          weather: { unit: 'celsius', windUnit: 'kmh' },
          news: { feedUrl: 'https://feeds.bbci.co.uk/news/rss.xml' },
          events: [],
          countdowns: [],
          display: { use24Hour: true, showSeconds: true },
        })
      })
  }, [])

  return (
    <ConfigContext.Provider value={config}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  return useContext(ConfigContext)
}
