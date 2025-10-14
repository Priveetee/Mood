<script lang="ts">
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
  <div class="w-full max-w-sm rounded-xl border bg-card text-card-foreground shadow-sm">
    <div class="flex flex-col space-y-1.5 p-6">
      <h3 class="text-2xl font-semibold leading-none tracking-tight">Configuration Initiale</h3>
      <p class="text-sm text-muted-foreground">
        Créez le premier compte administrateur pour commencer à utiliser l'application.
      </p>
    </div>
    <div class="p-6 pt-0">
      <form on:submit|preventDefault={handleRegister} class="grid gap-4">
        <div class="grid gap-2">
          <label for="username" class="text-sm font-medium leading-none">Nom d'utilisateur</label>
          <input id="username" type="text" bind:value={username} required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"/>
        </div>
        <div class="grid gap-2">
          <label for="password" class="text-sm font-medium leading-none">Mot de passe</label>
          <input id="password" type="password" bind:value={password} required class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"/>
        </div>
        {#if errorMessage}
          <p class="text-sm text-destructive">{errorMessage}</p>
        {/if}
        <button type="submit" class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground" disabled={isLoading}>
          {#if isLoading}
            Création en cours...
          {:else}
            Créer le compte
          {/if}
        </button>
      </form>
    </div>
  </div>
</div>
