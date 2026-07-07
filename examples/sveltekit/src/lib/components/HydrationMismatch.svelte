<script>
  import { browser } from '$app/environment'
</script>

<button
  style="padding: 0.75rem 1rem; font-size: 1rem; cursor: pointer;
         background-color: #06b6d4; color: #fff; border: none;
         border-radius: 6px; font-weight: 600;"
>
  Hydration: {browser ? 'CLIENT' : 'SERVER'}
</button>
