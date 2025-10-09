<script lang="ts">
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';
	import { signOut } from '@auth/sveltekit/client';

	let { children, data } = $props();
</script>

<div class="p-8">
	<div class="mx-auto max-w-7xl">
		<header class="mb-8 flex items-start justify-between">
			<div>
				<h1 class="text-4xl font-bold">Dashboard Admin</h1>
				<p class="text-muted-foreground">Bienvenue, {data.session?.user?.name ?? 'Admin'}.</p>
			</div>
			<div class="flex items-center gap-2">
				<ThemeSwitcher />
				<button
					type="button"
					on:click={() => signOut()}
					class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium"
				>
					Se déconnecter
				</button>
			</div>
		</header>

		<main>
			{@render children?.()}
		</main>
	</div>
</div>
