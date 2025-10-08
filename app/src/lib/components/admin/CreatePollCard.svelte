<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	export let onCreatePoll: () => Promise<void>;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Nouveau sondage</Card.Title>
	</Card.Header>
	<Card.Content>
		<button
			on:click={onCreatePoll}
			class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
		>
			+ Créer un sondage
		</button>
	</Card.Content>
</Card.Root>
