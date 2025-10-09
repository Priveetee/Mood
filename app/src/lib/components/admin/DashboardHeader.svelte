<script lang="ts">
	import { signOut } from '@auth/sveltekit/client';
</script>

<div class="flex items-center justify-between">
	<div>
		<h1 class="text-4xl font-bold">Dashboard Admin</h1>
		<p class="text-muted-foreground">Bienvenue, Admin.</p>
	</div>
	<div class="flex items-center gap-2">
		<button
			type="button"
			on:click={() => signOut()}
			class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md border px-4 py-2 text-sm font-medium"
		>
			Se déconnecter
		</button>
	</div>
</div>
