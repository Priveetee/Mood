<script lang="ts">
  import { signIn } from '@auth/sveltekit/client';
  import { goto } from '$app/navigation';

  let username = '';
  let password = '';
  let error = '';
  let loading = false;

  async function handleLogin() {
    loading = true;
    error = '';
    try {
      const result = await signIn('credentials', {
        username,
        password,
        redirect: false,
      });
      if (result?.error) {
        if (result.error === 'CredentialsSignin') {
          error = "Nom d'utilisateur ou mot de passe incorrect.";
        } else {
          error = "Une erreur d'authentification est survenue.";
        }
      } else if (result?.ok) {
        await goto('/admin');
      }
    } catch (e) {
      error = 'Une erreur de connexion est survenue.';
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Connexion Admin</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-muted/40 p-4">
  <div class="w-full max-w-md rounded-xl border bg-card text-card-foreground shadow-sm">
    <div class="flex flex-col space-y-1.5 p-6">
      <h3 class="text-2xl font-semibold leading-none tracking-tight">Administration</h3>
      <p class="text-sm text-muted-foreground">Connectez-vous pour accéder au dashboard</p>
    </div>
    <div class="p-6 pt-0">
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <div class="space-y-2">
          <label for="username" class="text-sm font-medium leading-none">Nom d'utilisateur</label>
          <input id="username" type="text" bind:value={username} placeholder="admin" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
        </div>
        <div class="space-y-2">
          <label for="password" class="text-sm font-medium leading-none">Mot de passe</label>
          <input id="password" type="password" bind:value={password} placeholder="••••••••" required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
        </div>
        {#if error}
          <p class="text-sm text-destructive">{error}</p>
        {/if}
        <button
          type="submit"
          class="inline-flex h-10 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Connexion...' : 'Se connecter'}
        </button>
      </form>
    </div>
  </div>
</div>
