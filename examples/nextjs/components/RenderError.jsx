'use client'

import { useState } from 'react'

export default function RenderError() {
  const [crash, setCrash] = useState(false)
  if (crash) throw new Error('Render crash!')
  return (
    <button
      style={{
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        cursor: 'pointer',
        backgroundColor: '#eab308',
        color: '#000',
        border: 'none',
        borderRadius: 6,
        fontWeight: 600,
      }}
      onClick={() => setCrash(true)}
    >
      Render Error (triggers error + console.error)
    </button>
  )
}
