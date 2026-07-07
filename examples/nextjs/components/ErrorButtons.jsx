'use client'

const btnStyle = {
  padding: '0.75rem 1rem',
  fontSize: '1rem',
  cursor: 'pointer',
  backgroundColor: '#dc2626',
  color: '#fff',
  border: 'none',
  borderRadius: 6,
  fontWeight: 600,
}

export default function ErrorButtons() {
  const triggers = [
    { label: 'Throw Error', action: () => { throw new Error('Synchronous error!') } },
    { label: 'Unhandled Promise Rejection', action: () => Promise.reject(new Error('Promise rejected!')) },
    { label: 'console.error', action: () => console.error('Manual console.error', { detail: 'some context' }) },
    {
      label: 'Async Error (setTimeout)',
      action: () => setTimeout(() => { throw new Error('Async timeout error!') }, 100),
    },
    {
      label: 'Nested Error',
      action: () => {
        const a = () => b();
        const b = () => c();
        const c = () => { throw new Error('Nested error!') };
        a();
      },
    },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {triggers.map(({ label, action }) => (
        <button key={label} style={btnStyle} onClick={action}>
          {label}
        </button>
      ))}
    </div>
  )
}
