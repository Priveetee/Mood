<script lang="ts">
	import { signIn } from '@auth/sveltekit/client';
	import { goto } from '$app/navigation';
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
				redirect: false
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

<svelte:head>
	<title>Connexion Admin</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header>
			<Card.Title class="text-2xl">Administration</Card.Title>
			<Card.Description>Connectez-vous pour accéder au dashboard</Card.Description>
		</Card.Header>
		<Card.Content>
			<form on:submit|preventDefault={handleLogin} class="space-y-4">
				<div class="space-y-2">
					<Label for="username">Nom d'utilisateur</Label>
					<Input id="username" type="text" bind:value={username} placeholder="admin" required />
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
		</Card.Content>
	</Card.Root>
</div>
