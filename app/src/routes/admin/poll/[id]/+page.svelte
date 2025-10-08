<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { ArrowLeft } from 'lucide-svelte';

	export let data;

	const { poll } = data;

	const voteCounts = {
		vert: 0,
		bleu: 0,
		orange: 0,
		rouge: 0
	};

	poll.votes.forEach((vote) => {
		if (vote.mood in voteCounts) {
			voteCounts[vote.mood]++;
		}
	});

	const comments = poll.votes.filter((v) => v.comment);
</script>

<svelte:head>
	<title>Résultats du Sondage</title>
</svelte:head>

<div class="p-8">
	<div class="mx-auto max-w-4xl">
		<a href="/admin" class="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
			<ArrowLeft class="h-4 w-4" />
			Retour au Dashboard
		</a>

		<div class="mb-8">
			<h1 class="text-4xl font-bold">Résultats du Sondage</h1>
			<p class="font-mono text-xs text-muted-foreground">{poll.id}</p>
		</div>

		<div class="grid grid-cols-2 gap-4 md:grid-cols-4">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Très bien</Card.Title>
					<span class="text-xl">😊</span>
				</Card.Header>
				<Card.Content>
					<div class="text-4xl font-bold">{voteCounts.vert}</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Neutre</Card.Title>
					<span class="text-xl">😐</span>
				</Card.Header>
				<Card.Content>
					<div class="text-4xl font-bold">{voteCounts.bleu}</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Moyen</Card.Title>
					<span class="text-xl">😕</span>
				</Card.Header>
				<Card.Content>
					<div class="text-4xl font-bold">{voteCounts.orange}</div>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Pas bien</Card.Title>
					<span class="text-xl">😞</span>
				</Card.Header>
				<Card.Content>
					<div class="text-4xl font-bold">{voteCounts.rouge}</div>
				</Card.Content>
			</Card.Root>
		</div>

		<Card.Root class="mt-8">
			<Card.Header>
				<Card.Title>Commentaires ({comments.length})</Card.Title>
			</Card.Header>
			<Card.Content>
				{#if comments.length > 0}
					<Table.Root>
						<Table.Body>
							{#each comments as vote}
								<Table.Row>
									<Table.Cell class="font-medium">{vote.comment}</Table.Cell>
									<Table.Cell class="text-right text-sm text-muted-foreground">
										{new Date(vote.createdAt).toLocaleString('fr-FR')}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				{:else}
					<p class="text-sm text-muted-foreground">Aucun commentaire pour ce sondage.</p>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>
</div>
