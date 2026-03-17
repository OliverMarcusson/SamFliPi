import React from 'react'

export default function Card({ children, className = '' }) {
  return (
    <div
      className={`rounded-2xl px-5 py-4 h-full ${className}`}
      style={{
        background: 'var(--card-bg)',
        backdropFilter: 'blur(12px)',
        border: '1px solid var(--card-border)',
      }}
    >
      {children}
    </div>
  )
}
