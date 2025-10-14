<script lang="ts">
	export let onCreatePoll: () => Promise<void>;
</script>

<div class="rounded-xl border bg-card text-card-foreground shadow-sm">
	<div class="flex flex-col space-y-1.5 p-6">
		<h3 class="font-semibold tracking-tight text-lg">Nouveau sondage</h3>
	</div>
	<div class="p-6 pt-0">
		<button
			on:click={onCreatePoll}
			class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
		>
			+ Créer un sondage
		</button>
	</div>
</div>
