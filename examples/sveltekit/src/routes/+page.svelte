<script>
  import ErrorButtons from '$lib/components/ErrorButtons.svelte'
  import DeepTree from '$lib/components/DeepTree.svelte'
  import RenderError from '$lib/components/RenderError.svelte'
  import HydrationMismatch from '$lib/components/HydrationMismatch.svelte'
</script>

<main style="padding: 2rem; font-family: system-ui, sans-serif; max-width: 480px; margin: 0 auto;">
  <h1 style="font-size: 1.75rem; margin: 0 0 0.5rem;">errplay SvelteKit Demo</h1>
  <p style="margin: 0 0 0.25rem; color: #555;">
    Click a button to trigger an error — watch your terminal!
  </p>
  <p style="margin: 0 0 1.5rem; font-size: 0.85rem; color: #888;">
    Run <code style="background: #eee; padding: 1px 4px; border-radius: 3px;">npm run dev</code> in the project root.
  </p>
  <div style="display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 1rem;">
    <RenderError />
    <HydrationMismatch />
  </div>
  <ErrorButtons />
  <div style="margin-top: 1rem;"></div>
  <DeepTree />
</main>
