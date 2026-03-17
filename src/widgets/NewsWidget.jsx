import React, { useState, useEffect, useRef } from 'react'
import { Rss } from 'lucide-react'
import Card from '../components/Card.jsx'
import { useNews } from '../hooks/useNews.js'

const ROTATE_INTERVAL = 8000

export default function NewsWidget() {
  const { items, isLoading, error } = useNews()
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(true)
  const timerRef = useRef(null)

  useEffect(() => {
    if (!items.length) return

    timerRef.current = setInterval(() => {
      setVisible(false)
      setTimeout(() => {
        setIndex(i => (i + 1) % items.length)
        setVisible(true)
      }, 500)
    }, ROTATE_INTERVAL)

    return () => clearInterval(timerRef.current)
  }, [items.length])

  const current = items[index]

  return (
    <Card>
      <div className="flex items-center gap-2 mb-2">
        <Rss size={14} style={{ color: '#fbbf24' }} />
        <span style={{ color: '#fbbf24', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          News
        </span>
        {items.length > 0 && (
          <span style={{ color: 'var(--label)', fontSize: '0.6rem', marginLeft: 'auto', fontFamily: 'JetBrains Mono, monospace' }}>
            {index + 1}/{items.length}
          </span>
        )}
      </div>

      <div style={{ minHeight: '4rem', position: 'relative' }}>
        {isLoading && (
          <div style={{ color: 'var(--label)', fontSize: '0.9rem' }}>Loading headlines…</div>
        )}
        {(error || (!isLoading && items.length === 0)) && (
          <div style={{ color: 'var(--label)', fontSize: '0.9rem' }}>Headlines unavailable</div>
        )}
        {current && (
          <div
            key={index}
            className={visible ? 'fade-in' : ''}
            style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.4s ease' }}
          >
            <div style={{ color: 'var(--primary)', fontSize: '0.95rem', fontWeight: 400, lineHeight: 1.4, marginBottom: '0.35rem' }}>
              {current.title}
            </div>
            {current.description && (
              <div style={{
                color: 'var(--secondary)',
                fontSize: '0.78rem',
                fontWeight: 300,
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}>
                {current.description?.replace(/<[^>]+>/g, '')}
              </div>
            )}
          </div>
        )}
      </div>

      {items.length > 1 && (
        <div className="flex gap-1 mt-2 justify-center">
          {items.slice(0, 10).map((_, i) => (
            <div
              key={i}
              style={{
                width: i === index ? 12 : 4,
                height: 3,
                borderRadius: 2,
                background: i === index ? '#fbbf24' : 'var(--dot-inactive)',
                transition: 'width 0.3s ease, background 0.3s ease',
              }}
            />
          ))}
        </div>
      )}
    </Card>
  )
}
