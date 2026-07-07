<script>
  let { node, depth } = $props()
</script>

<div style="padding-left: {depth * 16}px;">
  <span style="color: {depth === 0 ? '#9333ea' : '#555'};">
    {#if depth > 0}‣ {/if}{node.label}
  </span>
  {#each node.children as child, i}
    <svelte:self node={child} depth={depth + 1} />
  {/each}
</div>
