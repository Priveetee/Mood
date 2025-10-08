<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	export let data;
	const { poll } = data;
	const voteCounts = { vert: 0, bleu: 0, orange: 0, rouge: 0 };
	poll.votes.forEach(vote => {
		if (vote.mood in voteCounts) {
			voteCounts[vote.mood]++;
		}
	});
</script>

<svelte:head>
	<title>Résultats du Sondage</title>
</svelte:head>

<div class="p-8">
	<div class="mx-auto max-w-4xl">
		<a href="/admin" class="mb-8 inline-block text-sm hover:underline">&larr; Retour au Dashboard</a>
		
		<h1 class="text-4xl font-bold">Résultats du Sondage</h1>
		<p class="font-mono text-xs text-muted-foreground">{poll.id}</p>

		<div class="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
			<Card.Root>
				<Card.Header>
					<Card.Title>😊 Très bien</Card.Title>
				</Card.Header>
				<Card.Content class="text-4xl font-bold">{voteCounts.vert}</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>😐 Neutre</Card.Title>
				</Card.Header>
				<Card.Content class="text-4xl font-bold">{voteCounts.bleu}</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>😕 Moyen</Card.Title>
				</Card.Header>
				<Card.Content class="text-4xl font-bold">{voteCounts.orange}</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header>
					<Card.Title>😞 Pas bien</Card.Title>
				</Card.Header>
				<Card.Content class="text-4xl font-bold">{voteCounts.rouge}</Card.Content>
			</Card.Root>
		</div>

		<Card.Root class="mt-8">
			<Card.Header>
				<Card.Title>Commentaires ({poll.votes.filter(v => v.comment).length})</Card.Title>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Body>
						{#each poll.votes as vote}
							{#if vote.comment}
								<Table.Row>
									<Table.Cell>{vote.comment}</Table.Cell>
									<Table.Cell class="text-right text-muted-foreground">
										{new Date(vote.createdAt).toLocaleString('fr-FR')}
									</Table.Cell>
								</Table.Row>
							{/if}
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>
	</div>
</div>
