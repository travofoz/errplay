'use client'

export default function Leaf({ node, depth }) {
  return (
    <div style={{ paddingLeft: depth * 16 }}>
      <span style={{ color: depth === 0 ? '#9333ea' : '#555' }}>{'‣ '.repeat(depth === 0 ? 0 : 1)}{node.label}</span>
      {node.children.map((child, i) => (
        <Leaf key={i} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}
