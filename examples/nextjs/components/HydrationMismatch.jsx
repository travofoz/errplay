'use client'

export default function HydrationMismatch() {
  const isServer = typeof window === 'undefined'
  return (
    <button
      style={{
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        cursor: 'pointer',
        backgroundColor: '#06b6d4',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        fontWeight: 600,
      }}
    >
      Hydration: {isServer ? 'SERVER' : 'CLIENT'}
    </button>
  )
}
