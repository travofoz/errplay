<script>
  import Leaf from './Leaf.svelte'

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
</script>

<div style="font-family: monospace; font-size: 0.85rem;">
  <Leaf node={tree} depth={0} />
</div>
