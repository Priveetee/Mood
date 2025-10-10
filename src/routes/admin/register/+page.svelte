<!-- src/routes/admin/register/+page.svelte -->
<script lang="ts">
  import * as Card from '$lib/components/ui/card';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';

  let username = '';
  let password = '';
  let isLoading = false;
  let errorMessage = '';

  const toastConfig = {
    theme: 'dotted',
    position: 'top-right',
    entryAnimation: 'windLeftIn',
    exitAnimation: 'windRightOut',
  };

  const errorToastConfig = {
    ...toastConfig,
    showIcon: true,
    iconAnimation: 'jelly',
    iconTimingFunction: 'ease-in-out',
    iconBorderRadius: '50%',
    iconType: 'error',
  };

  async function handleRegister() {
    isLoading = true;
    errorMessage = '';

    try {
      const response = await fetch('/api/admin/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const { default: toast } = await import('not-a-toast');

      if (response.ok) {
        toast({
          ...toastConfig,
          message: 'Compte administrateur créé. Vous pouvez maintenant vous connecter.',
        });
        window.location.href = '/admin/login';
      } else {
        const data = await response.json();
        const message = data.message || 'Une erreur serveur est survenue.';
        errorMessage = message;
        toast({
          ...errorToastConfig,
          message: message,
        });
      }
    } catch (error) {
      const { default: toast } = await import('not-a-toast');
      const message = 'Une erreur de connexion est survenue.';
      errorMessage = message;
      console.error("Erreur inattendue lors de l'inscription:", error);
      toast({
        ...errorToastConfig,
        message: message,
      });
    } finally {
      isLoading = false;
    }
  }
</script>

<svelte:head>
  <title>Créer un compte Administrateur</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-muted/40 p-4">
  <Card.Root class="w-full max-w-sm">
    <Card.Header>
      <Card.Title class="text-2xl">Configuration Initiale</Card.Title>
      <Card.Description>
        Créez le premier compte administrateur pour commencer à utiliser l'application.
      </Card.Description>
    </Card.Header>
    <Card.Content>
      <form on:submit|preventDefault={handleRegister} class="grid gap-4">
        <div class="grid gap-2">
          <Label for="username">Nom d'utilisateur</Label>
          <Input id="username" type="text" bind:value={username} required />
        </div>
        <div class="grid gap-2">
          <Label for="password">Mot de passe</Label>
          <Input id="password" type="password" bind:value={password} required />
        </div>
        {#if errorMessage}
          <p class="text-sm text-destructive">{errorMessage}</p>
        {/if}
        <Button type="submit" class="w-full" disabled={isLoading}>
          {#if isLoading}
            Création en cours...
          {:else}
            Créer le compte
          {/if}
        </Button>
      </form>
    </Card.Content>
  </Card.Root>
</div>
