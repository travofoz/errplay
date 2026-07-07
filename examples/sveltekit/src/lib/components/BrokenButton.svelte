<script>
  const crash = () => { throw new Error('Deep error!') }
</script>

<button
  style="padding: 0.75rem 1rem; font-size: 1rem; cursor: pointer;
         background-color: #9333ea; color: #fff; border: none;
         border-radius: 6px; font-weight: 600;"
  onclick={crash}
>
  Deep Error
</button>
