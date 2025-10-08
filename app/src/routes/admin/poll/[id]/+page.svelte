<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { ArrowLeft } from 'lucide-svelte';
	import BarChart from '$lib/components/admin/BarChart.svelte';

	export let data;
	const { poll } = data;

	const voteCounts = { vert: 0, bleu: 0, orange: 0, rouge: 0 };
	poll.votes.forEach((vote) => {
		if (vote.mood in voteCounts) {
			voteCounts[vote.mood]++;
		}
	});

	const comments = poll.votes.filter((v) => v.comment && v.comment.trim() !== '');

	const chartData = {
		labels: ['Très bien', 'Neutre', 'Moyen', 'Pas bien'],
		datasets: [
			{
				label: 'Nombre de votes',
				data: [voteCounts.vert, voteCounts.bleu, voteCounts.orange, voteCounts.rouge],
				backgroundColor: [
					'hsl(var(--mood-green))',
					'hsl(var(--mood-blue))',
					'hsl(var(--mood-orange))',
					'hsl(var(--mood-red))'
				],
				borderColor: 'hsl(var(--border))',
				borderWidth: 1
			}
		]
	};

	const chartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false
			},
			title: {
				display: true,
				text: 'Répartition des humeurs',
				color: 'hsl(var(--foreground))',
				font: {
					size: 18
				}
			}
		},
		scales: {
			y: {
				beginAtZero: true,
				ticks: {
					color: 'hsl(var(--muted-foreground))',
					stepSize: 1
				},
				grid: {
					color: 'hsl(var(--border))'
				}
			},
			x: {
				ticks: {
					color: 'hsl(var(--muted-foreground))'
				},
				grid: {
					display: false
				}
			}
		}
	};
</script>

<svelte:head>
	<title>Résultats du Sondage: {poll.id}</title>
</svelte:head>

<div class="p-4 md:p-8">
	<div class="mx-auto max-w-7xl">
		<a
			href="/admin"
			class="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Retour au Dashboard
		</a>

		<div class="mb-8">
			<h1 class="text-4xl font-bold">Résultats du Sondage</h1>
			<p class="font-mono text-xs text-muted-foreground">{poll.id}</p>
		</div>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<Card.Root>
					<Card.Header>
						<Card.Title>Tendance globale</Card.Title>
					</Card.Header>
					<Card.Content class="h-[400px] pr-4">
						<BarChart data={chartData} options={chartOptions} />
					</Card.Content>
				</Card.Root>
			</div>

			<div class="lg:col-span-1">
				<Card.Root>
					<Card.Header>
						<Card.Title>Commentaires ({comments.length})</Card.Title>
					</Card.Header>
					<Card.Content>
						{#if comments.length > 0}
							<div class="flex max-h-[400px] flex-col gap-4 overflow-y-auto pr-2">
								{#each comments as vote}
									<div class="rounded-lg border bg-muted/50 p-4">
										<p class="text-sm">{vote.comment}</p>
										<p class="mt-2 text-right text-xs text-muted-foreground">
											{new Date(vote.createdAt).toLocaleString('fr-FR')}
										</p>
									</div>
								{/each}
							</div>
						{:else}
							<p class="text-sm text-muted-foreground">Aucun commentaire pour ce sondage.</p>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>
</div>
