<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import { ArrowLeft } from 'lucide-svelte';
	import Chart from 'chart.js/auto';
	import type { ChartConfiguration, ScriptableContext } from 'chart.js';
	import { transparentize } from '$lib/chart-utils';

	export let data;
	const { poll } = data;
	let canvasElement: HTMLCanvasElement;
	let chart: Chart;
	let delayed: boolean;

	const voteCounts = { vert: 0, bleu: 0, orange: 0, rouge: 0 };
	poll.votes.forEach((vote: { mood: string | number; }) => {
		if (vote.mood in voteCounts) {
			voteCounts[vote.mood]++;
		}
	});
	const comments = poll.votes.filter((v: { comment: any; }) => v.comment && v.comment.trim() !== '');

	const chartConfig: ChartConfiguration = {
		type: 'bar',
		data: {
			labels: ['Très bien', 'Neutre', 'Moyen', 'Pas bien'],
			datasets: [
				{
					label: 'Nombre de votes',
					data: [voteCounts.vert, voteCounts.bleu, voteCounts.orange, voteCounts.rouge],
					borderWidth: 2,
					borderRadius: Number.MAX_VALUE,
					borderSkipped: false
				}
			]
		},
		options: {
			responsive: true,
			maintainAspectRatio: false,
			animation: {
				onComplete: () => { delayed = true; },
				delay: (context) => {
					let delay = 0;
					if (context.type === 'data' && context.mode === 'default' && !delayed) {
						delay = context.dataIndex * 300 + context.datasetIndex * 100;
					}
					return delay;
				}
			},
			plugins: {
				legend: { display: false },
				title: {
					display: true,
					text: 'Répartition des humeurs',
					color: 'hsl(var(--foreground))',
					font: { size: 18 }
				}
			},
			scales: {
				y: {
					beginAtZero: true,
					ticks: { color: 'hsl(var(--muted-foreground))', stepSize: 1 },
					grid: { color: 'hsl(var(--border))' }
				},
				x: {
					ticks: { color: 'hsl(var(--muted-foreground))' },
					grid: { display: false }
				}
			}
		}
	};
	
	onMount(() => {
		const computedStyles = getComputedStyle(document.documentElement);
		const moodColors = {
			'Très bien': computedStyles.getPropertyValue('--mood-green').trim(),
			'Neutre': computedStyles.getPropertyValue('--mood-blue').trim(),
			'Moyen': computedStyles.getPropertyValue('--mood-orange').trim(),
			'Pas bien': computedStyles.getPropertyValue('--mood-red').trim()
		};
		const getResolvedColor = (ctx: ScriptableContext<'bar'>) => {
			const mood = ctx.chart.data.labels![ctx.dataIndex] as string;
			const colorValues = moodColors[mood] || '0 0 0';
			return `hsl(${colorValues})`;
		};
		if (chartConfig.data.datasets[0]) {
			chartConfig.data.datasets[0].borderColor = getResolvedColor;
			chartConfig.data.datasets[0].backgroundColor = (ctx: ScriptableContext<"bar">) => transparentize(getResolvedColor(ctx), 0.5);
		}
		const ctx = canvasElement.getContext('2d');
		if (ctx) {
			chart = new Chart(ctx, chartConfig);
		}
	});

	onDestroy(() => {
		chart?.destroy();
	});
</script>

<svelte:head>
	<title>Résultats: {poll.id}</title>
</svelte:head>

<div class="p-4 md:p-8">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8 flex items-center justify-between">
			<a
				href="/admin"
				class="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
			>
				<ArrowLeft class="h-4 w-4" />
				Retour au Dashboard
			</a>
			<a
				href="/api/admin/export/{poll.id}.csv"
				class="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
				download
			>
				Exporter en CSV
			</a>
		</div>

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
					<Card.Content class="h-[400px] p-4">
						<canvas bind:this={canvasElement}></canvas>
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
