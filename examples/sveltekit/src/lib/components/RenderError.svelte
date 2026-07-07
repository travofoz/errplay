<script>
  let crash = $state(false)
  if (crash) throw new Error('Render crash!')
  const toggle = () => crash = true
</script>

<button
  style="padding: 0.75rem 1rem; font-size: 1rem; cursor: pointer;
         background-color: #eab308; color: #000; border: none;
         border-radius: 6px; font-weight: 600;"
  onclick={toggle}
>
  Render Error (triggers error + console.error)
</button>
