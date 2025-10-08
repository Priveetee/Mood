<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
</script>

<div class="mb-8 flex items-center justify-between">
	<div>
		<h1 class="mb-2 text-4xl font-bold text-white">Dashboard Admin</h1>
		<p class="text-white/70">Bienvenue, Admin</p>
	</div>
	<button
		type="button"
		on:click={() => signOut()}
		class="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium whitespace-nowrap ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
	>
		Se déconnecter
	</button>
</div>
