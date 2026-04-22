<script>
  import { supabase } from '$lib/supabase';
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import '../app.css';

  let user = $state(null);

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser();
    user = data.user;

    if (!user && location.pathname !== '/login') {
      goto('/login');
    }
  };

  onMount(checkUser);
</script>
<style>
  :global(body) {
    margin: 0;
    background: linear-gradient(135deg, #d1fae5, #bbf7d0, #dcfce7);
    min-height: 100vh;
  }
</style>

<slot />