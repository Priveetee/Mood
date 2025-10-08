<script lang="ts">
  import { signIn } from '@auth/sveltekit/client';
  import { goto } from '$app/navigation';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as Card from '$lib/components/ui/card';

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
        error = 'Identifiants invalides';
      } else {
        await goto('/admin');
      }
    } catch (e) {
      error = 'Une erreur est survenue';
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
  <Card.Root class="w-full max-w-md">
    <Card.Header>
      <Card.Title class="text-2xl">Administration</Card.Title>
      <Card.Description>Connectez-vous pour accéder au dashboard</Card.Description>
    </Card.Header>
    <Card.Content>
      <form on:submit|preventDefault={handleLogin} class="space-y-4">
        <div class="space-y-2">
          <Label for="username">Nom d'utilisateur</Label>
          <Input
            id="username"
            type="text"
            bind:value={username}
            placeholder="admin"
            required
          />
        </div>
        <div class="space-y-2">
          <Label for="password">Mot de passe</Label>
          <Input
            id="password"
            type="password"
            bind:value={password}
            placeholder="••••••••"
            required
          />
        </div>
        {#if error}
          <p class="text-sm text-red-500">{error}</p>
        {/if}
        <Button type="submit" class="w-full" disabled={loading}>
          {loading ? 'Connexion...' : 'Se connecter'}
        </Button>
      </form>
    </Card.Content>
  </Card.Root>
</div>
