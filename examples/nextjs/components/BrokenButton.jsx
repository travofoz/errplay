'use client'

export default function BrokenButton() {
  return (
    <button
      style={{
        padding: '0.75rem 1rem',
        fontSize: '1rem',
        cursor: 'pointer',
        backgroundColor: '#9333ea',
        color: '#fff',
        border: 'none',
        borderRadius: 6,
        fontWeight: 600,
      }}
      onClick={() => { throw new Error('Deep error!') }}
    >
      Deep Error
    </button>
  )
}
