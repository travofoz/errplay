'use client'
import { initErrplay } from 'errplay/client'

if (typeof window !== 'undefined') {
  initErrplay({ endpoint: '/api/errplay' })
}

export default function DevTools() {
  return null
}
