import React from 'react'
import Card from '../components/Card.jsx'
import { useQuote } from '../hooks/useQuote.js'

export default function QuoteWidget() {
  const { quote, author, isLoading } = useQuote()

  return (
    <Card className="flex flex-col justify-center py-5">
      {isLoading ? (
        <div style={{ color: 'var(--label)', fontSize: '1.5rem', textAlign: 'center' }}>Loading…</div>
      ) : (
        <>
          <blockquote
            style={{
              color: 'var(--accent-quote)',
              fontSize: '1.5rem',
              fontStyle: 'italic',
              fontWeight: 300,
              lineHeight: 1.6,
              paddingLeft: '0.75rem',
              borderLeft: '2px solid var(--accent-quote-border)',
            }}
          >
            "{quote}"
          </blockquote>
          <div style={{ color: 'var(--accent-quote-dim)', fontSize: '1.5rem', fontWeight: 500, marginTop: '0.6rem', textAlign: 'right' }}>
            — {author}
          </div>
        </>
      )}
    </Card>
  )
}
