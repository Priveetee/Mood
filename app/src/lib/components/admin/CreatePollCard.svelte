<script lang="ts">
	import * as Card from '$lib/components/ui/card';

	export let onCreatePoll: () => Promise<void>;
	export let loading: boolean;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Créer un nouveau sondage</Card.Title>
		<Card.Description>
			Générez un lien unique pour un nouveau sondage (expire dans 15 jours)
		</Card.Description>
	</Card.Header>
	<Card.Content>
		<button
			type="button"
			on:click={onCreatePoll}
			disabled={loading}
			class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium whitespace-nowrap text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
		>
			+ Nouveau sondage
		</button>
	</Card.Content>
</Card.Root>
