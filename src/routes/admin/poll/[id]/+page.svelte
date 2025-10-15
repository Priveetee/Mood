<script lang="ts">
	import { ArrowLeft, Download, Power } from 'lucide-svelte';
	import Chart from 'chart.js/auto';
	import { invalidateAll } from '$app/navigation';
	import { onMount, onDestroy } from 'svelte';
	import { showToast } from '$lib/toast';

	let { data } = $props();
	let poll = $state(data.poll);

	$effect(() => {
		poll = data.poll;
	});

	let canvasElement: HTMLCanvasElement;
	let chart: Chart | undefined = undefined;
	let isClosing = $state(false);

	const voteCounts = { vert: 0, bleu: 0, orange: 0, rouge: 0 };
	poll.votes.forEach((vote: { mood: string | number }) => {
		const mood = vote.mood as keyof typeof voteCounts;
		if (mood in voteCounts) {
			voteCounts[mood]++;
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
							callbacks: {
								label: (context) => {
									if (context.dataset.data.length === 0) return '';
									const total = context.dataset.data.reduce((a, b) => (a as number) + (b as number), 0) as number;
									if(total === 0) return `${context.label}: 0 votes (0%)`;
									const value = context.parsed;
									const percentage = ((value / total) * 100).toFixed(1);
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

	async function closePoll() {
		if (isClosing) return;
		isClosing = true;

		const response = await fetch('/api/admin/close-poll', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ pollId: poll.id })
		});

		if (response.ok) {
			await invalidateAll();
			await showToast('success', 'Le sondage a été fermé.');
		} else {
			await showToast('error', 'Erreur lors de la fermeture du sondage.');
		}
		isClosing = false;
	}
</script>

<svelte:head>
	<title>Résultats: {poll.id}</title>
</svelte:head>

<div class="min-h-screen bg-background p-4 md:p-8">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8 flex flex-wrap items-center justify-between gap-4">
			<a
				href="/admin/campaign/{poll.campaignId}"
				class="inline-flex items-center gap-2 rounded-lg border-2 border-border bg-card px-4 py-2.5 text-sm font-medium text-card-foreground transition-all hover:bg-muted hover:shadow-md"
			>
				<ArrowLeft class="h-4 w-4" />
				Retour à la campagne
			</a>
			<div class="flex items-center gap-2">
				<a
					href="/api/admin/export/{poll.id}.csv"
					class="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90"
					download
				>
					<Download class="h-4 w-4" />
					Exporter en CSV
				</a>
				{#if !poll.closed}
					<button
						onclick={closePoll}
						disabled={isClosing}
						class="inline-flex items-center justify-center gap-2 rounded-lg bg-destructive px-6 py-2.5 text-sm font-semibold text-destructive-foreground shadow-md transition-all hover:bg-destructive/90 disabled:opacity-50"
					>
						<Power class="h-4 w-4" />
						{isClosing ? 'Fermeture...' : 'Fermer le sondage'}
					</button>
				{/if}
			</div>
		</div>

		<div class="mb-8">
			<div class="mb-2 flex items-center gap-3">
				<div class="h-10 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50"></div>
				<h1 class="text-3xl font-bold text-foreground md:text-4xl">
					Sondage de {poll.managerName}
				</h1>
			</div>
			<p class="pl-6 font-mono text-xs text-muted-foreground">{poll.id}</p>
			<div class="mt-2 flex gap-4 pl-6 text-sm">
				<span class="text-muted-foreground"
					>Total: <span class="font-bold text-foreground">{totalVotes}</span> votes</span
				>
				<span class="text-muted-foreground"
					>Commentaires: <span class="font-bold text-foreground">{comments.length}</span></span
				>
				{#if poll.closed}
					<span
						class="inline-flex items-center rounded-full bg-destructive/20 px-2.5 py-0.5 text-xs font-semibold text-destructive-foreground"
					>
						Fermé
					</span>
				{:else}
					<span
						class="inline-flex items-center rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary-foreground"
					>
						Actif
					</span>
				{/if}
			</div>
		</div>

		<div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
			<div class="lg:col-span-2">
				<div class="rounded-xl border bg-card text-card-foreground shadow-sm">
					<div class="border-b border-border bg-card p-6">
						<h3 class="flex items-center gap-2 text-xl font-semibold text-card-foreground">
							<span>📊</span>
							Répartition des humeurs
						</h3>
					</div>
					<div class="h-[500px] bg-card p-8">
						<canvas bind:this={canvasElement}></canvas>
					</div>
				</div>
			</div>
			<div class="lg:col-span-1">
				<div class="h-full rounded-xl border bg-card text-card-foreground shadow-sm">
					<div class="border-b border-border bg-card p-6">
						<h3 class="flex items-center gap-2 text-xl font-semibold text-card-foreground">
							<span>💬</span>
							Commentaires ({comments.length})
						</h3>
					</div>
					<div class="bg-card p-4">
						{#if comments.length > 0}
							<div class="flex max-h-[450px] flex-col gap-3 overflow-y-auto pr-2">
								{#each comments as vote (vote.id)}
									<div
										class="group rounded-xl border border-border bg-muted/50 p-4 transition-all"
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
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
