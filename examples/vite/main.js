import { initErrplay } from 'errplay/client'

initErrplay({ endpoint: '/api/errplay' })

const byId = id => document.getElementById(id)

byId('btn-throw').onclick = () => { throw new Error('Synchronous error!') }
byId('btn-reject').onclick = () => Promise.reject(new Error('Promise rejected!'))
byId('btn-console').onclick = () => console.error('Manual console.error', { detail: 'some context' })
byId('btn-async').onclick = () => setTimeout(() => { throw new Error('Async timeout error!') }, 100)
byId('btn-nested').onclick = () => {
  const a = () => b()
  const b = () => c()
  const c = () => { throw new Error('Nested error!') }
  a()
}

// Module-level throw: imports a script that throws at the top level,
// testing whether Vite's overlay appears alongside errplay capture.
byId('btn-eval').onclick = () => {
  const s = document.createElement('script')
  s.textContent = 'throw new Error("Module-level throw!")'
  document.head.appendChild(s)
}
