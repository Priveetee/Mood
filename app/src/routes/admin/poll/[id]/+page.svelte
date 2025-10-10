<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import { ArrowLeft, Download } from 'lucide-svelte';
	import Chart from 'chart.js/auto';

	export let data;
	const { poll } = data;
	let canvasElement: HTMLCanvasElement;
	let chart: Chart;

	const voteCounts = { vert: 0, bleu: 0, orange: 0, rouge: 0 };
	poll.votes.forEach((vote: { mood: string | number }) => {
		if (vote.mood in voteCounts) {
			voteCounts[vote.mood]++;
		}
	});
	const comments = poll.votes.filter((v: { comment: any }) => v.comment && v.comment.trim() !== '');
	const totalVotes = poll.votes.length;

	onMount(() => {
		const computedStyles = getComputedStyle(document.documentElement);
		const greenColor = `hsl(${computedStyles.getPropertyValue('--mood-green').trim()})`;
		const blueColor = `hsl(${computedStyles.getPropertyValue('--mood-blue').trim()})`;
		const orangeColor = `hsl(${computedStyles.getPropertyValue('--mood-orange').trim()})`;
		const redColor = `hsl(${computedStyles.getPropertyValue('--mood-red').trim()})`;
		const textColor = `hsl(${computedStyles.getPropertyValue('--foreground').trim()})`;
		const cardBg = `hsl(${computedStyles.getPropertyValue('--card').trim()})`;

		const chartData = {
			labels: ['😊 Très bien', '😐 Neutre', '😕 Moyen', '😞 Pas bien'],
			datasets: [
				{
					label: 'Nombre de votes',
					data: [voteCounts.vert, voteCounts.bleu, voteCounts.orange, voteCounts.rouge],
					backgroundColor: [greenColor, blueColor, orangeColor, redColor],
					borderColor: cardBg,
					borderWidth: 4,
					hoverOffset: 15
				}
			]
		};

		const ctx = canvasElement.getContext('2d');
		if (ctx) {
			chart = new Chart(ctx, {
				type: 'doughnut',
				data: chartData,
				options: {
					responsive: true,
					maintainAspectRatio: false,
					plugins: {
						legend: {
							position: 'bottom',
							labels: {
								color: textColor,
								font: { size: 14, weight: 'bold' },
								padding: 20,
								usePointStyle: true,
								pointStyle: 'circle'
							}
						},
						tooltip: {
							backgroundColor: 'rgba(0, 0, 0, 0.9)',
							padding: 16,
							borderRadius: 8,
							titleFont: { size: 14, weight: 'bold' },
							bodyFont: { size: 13 },
							callbacks: {
								label: (context) => {
									const value = context.parsed;
									const percentage = ((value / totalVotes) * 100).toFixed(1);
									return `${context.label}: ${value} votes (${percentage}%)`;
								}
							}
						}
					}
				}
			});
		}
	});

	onDestroy(() => {
		chart?.destroy();
	});
</script>

<svelte:head>
	<title>Résultats: {poll.id}</title>
</svelte:head>

<div class="min-h-screen bg-background p-4 md:p-8">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8 flex flex-wrap items-center justify-between gap-4">
			<a
				href="/admin"
				class="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-all hover:bg-muted hover:shadow-md focus:ring-2 focus:ring-primary/50 focus:outline-none"
			>
				<ArrowLeft class="h-4 w-4" />
				Retour au Dashboard
			</a>
			<a
				href="/api/admin/export/{poll.id}.csv"
				class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg focus:ring-2 focus:ring-primary/50 focus:outline-none"
				download
			>
				<Download class="h-4 w-4" />
				Exporter en CSV
			</a>
		</div>

		<div class="mb-8">
			<div class="mb-2 flex items-center gap-3">
				<div class="h-10 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50"></div>
				<h1 class="text-3xl font-bold text-foreground md:text-4xl">Résultats du Sondage</h1>
			</div>
			<p class="pl-6 font-mono text-xs text-muted-foreground">{poll.id}</p>
			<div class="mt-2 flex gap-4 pl-6 text-sm">
				<span class="text-muted-foreground"
					>Total: <span class="font-bold text-foreground">{totalVotes}</span> votes</span
				>
				<span class="text-muted-foreground"
					>Commentaires: <span class="font-bold text-foreground">{comments.length}</span></span
				>
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<Card.Root class="overflow-hidden border shadow-xl">
					<Card.Header class="border-b border-border bg-card">
						<Card.Title class="flex items-center gap-2 text-xl text-card-foreground">
							<span>📊</span>
							Répartition des humeurs
						</Card.Title>
					</Card.Header>
					<Card.Content class="h-[500px] bg-card p-8">
						<canvas bind:this={canvasElement}></canvas>
					</Card.Content>
				</Card.Root>
			</div>
			<div class="lg:col-span-1">
				<Card.Root class="h-full overflow-hidden border shadow-xl">
					<Card.Header class="border-b border-border bg-card">
						<Card.Title class="flex items-center gap-2 text-xl text-card-foreground">
							<span>💬</span>
							Commentaires ({comments.length})
						</Card.Title>
					</Card.Header>
					<Card.Content class="bg-card p-4">
						{#if comments.length > 0}
							<div class="flex max-h-[450px] flex-col gap-3 overflow-y-auto pr-2">
								{#each comments as vote, i}
									<div
										class="group rounded-xl border border-border bg-muted/50 p-4 transition-all hover:border-primary/50 hover:shadow-md animate-[fadeIn_0.5s_ease-out_{i *
											0.1}s_backwards]"
									>
										<p class="text-sm leading-relaxed text-foreground">{vote.comment}</p>
										<p class="mt-3 text-right text-xs text-muted-foreground">
											{new Date(vote.createdAt).toLocaleString('fr-FR')}
										</p>
									</div>
								{/each}
							</div>
						{:else}
							<div class="flex h-[450px] items-center justify-center">
								<div class="text-center">
									<div class="mb-2 text-4xl opacity-50">💭</div>
									<p class="text-sm text-muted-foreground">Aucun commentaire pour ce sondage.</p>
								</div>
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			</div>
		</div>
	</div>
</div>

<style>
	@keyframes fadeIn {
		from {
			opacity: 0;
			transform: translateY(10px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
</style>
