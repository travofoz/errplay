<script>
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
</script>

<div style="display: flex; flex-direction: column; gap: 0.75rem;">
  {#each triggers as { label, action }}
    <button
      style="padding: 0.75rem 1rem; font-size: 1rem; cursor: pointer;
             background-color: #dc2626; color: #fff; border: none;
             border-radius: 6px; font-weight: 600;"
      onclick={action}
    >
      {label}
    </button>
  {/each}
</div>
