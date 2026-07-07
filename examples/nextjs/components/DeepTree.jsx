'use client'

import Leaf from './Leaf'

const tree = { label: 'root', children: [
  { label: 'a', children: [
    { label: 'a1', children: [] },
    { label: 'a2', children: [] },
  ]},
  { label: 'b', children: [
    { label: 'b1', children: [] },
    { label: 'b2', children: [
      { label: 'b2a', children: [] },
    ]},
  ]},
  { label: 'c', children: [] },
]}

export default function DeepTree() {
  return (
    <div style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
      <Leaf node={tree} depth={0} />
    </div>
  )
}
