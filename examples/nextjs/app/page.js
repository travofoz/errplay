import ErrorButtons from '../components/ErrorButtons'
import DeepTree from '../components/DeepTree'
import RenderError from '../components/RenderError'
import HydrationMismatch from '../components/HydrationMismatch'

export default function Page() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif', maxWidth: 480, margin: '0 auto' }}>
      <h1 style={{ fontSize: '1.75rem', margin: '0 0 0.5rem' }}>errplay Demo</h1>
      <p style={{ margin: '0 0 0.25rem', color: '#555' }}>
        Click a button to trigger an error — watch your terminal!
      </p>
      <p style={{ margin: '0 0 1.5rem', fontSize: '0.85rem', color: '#888' }}>
        Run <code style={{ background: '#eee', padding: '1px 4px', borderRadius: 3 }}>npm run dev</code> in the project root.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
        <RenderError />
        <HydrationMismatch />
      </div>
      <ErrorButtons />
      <div style={{ marginTop: '1rem' }} />
      <DeepTree />
    </main>
  )
}
