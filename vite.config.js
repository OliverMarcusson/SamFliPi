import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

function createMuninProxy(target, path, secret) {
  return {
    target,
    changeOrigin: true,
    secure: false,
    rewrite: () => path,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${secret}`,
    },
  }
}

function createProxy(target, path) {
  return {
    target,
    changeOrigin: true,
    secure: false,
    rewrite: () => path,
    headers: {
      Accept: 'application/json',
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const muninBaseUrl = env.MUNIN_BASE_URL || 'https://munin-sou.se'
  const eventsApiSecret = env.EVENTS_API_SECRET || ''
  const quotesBaseUrl = 'https://zenquotes.io'

  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api/munin/events/upcoming': createMuninProxy(
          muninBaseUrl,
          '/api/v1/events/upcoming',
          eventsApiSecret,
        ),
        '/api/munin/cyber/announcements/latest': createMuninProxy(
          muninBaseUrl,
          '/api/v1/cyber/announcements/latest',
          eventsApiSecret,
        ),
        '/api/quotes/today': createProxy(
          quotesBaseUrl,
          '/api/today',
        ),
      },
    },
  }
})
