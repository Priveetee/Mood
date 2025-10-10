<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import CreatePollCard from '$lib/components/admin/CreatePollCard.svelte';
	import PollsTable from '$lib/components/admin/PollsTable.svelte';
	import * as Card from '$lib/components/ui/card';
	import { Download, Calendar } from 'lucide-svelte';
	import Chart from 'chart.js/auto';

	export let data;

	let polls: any[] = [];
	let allVotes: any[] = data.allVotes || [];
	let filteredVotes: any[] = [];
	let toast: any;
	let pollingInterval: ReturnType<typeof setInterval>;
	let selectedPeriod: number = 30;
	let canvasElement: HTMLCanvasElement;
	let chart: Chart;

	const periods = [
		{ label: '1 mois', value: 30 },
		{ label: '3 mois', value: 90 },
		{ label: '6 mois', value: 180 }
	];

	onMount(async () => {
		const module = await import('not-a-toast');
		toast = module.default;
		await import('not-a-toast/style.css');

		await refreshData();
		pollingInterval = setInterval(refreshData, 10000);
	});

	onDestroy(() => {
		clearInterval(pollingInterval);
		chart?.destroy();
	});

	$: {
		const now = new Date();
		const cutoffDate = new Date(now.getTime() - selectedPeriod * 24 * 60 * 60 * 1000);
		filteredVotes = allVotes.filter((v) => new Date(v.date) >= cutoffDate);
		updateChart();
	}

	function updateChart() {
		if (!canvasElement) return;

		const moodCounts = { vert: 0, bleu: 0, orange: 0, rouge: 0 };
		filteredVotes.forEach((v) => {
			const moodMap = { 4: 'vert', 3: 'bleu', 2: 'orange', 1: 'rouge' };
			const mood = moodMap[v.value];
			if (mood) moodCounts[mood]++;
		});

		const computedStyles = getComputedStyle(document.documentElement);
		const greenColor = `hsl(${computedStyles.getPropertyValue('--mood-green').trim()})`;
		const blueColor = `hsl(${computedStyles.getPropertyValue('--mood-blue').trim()})`;
		const orangeColor = `hsl(${computedStyles.getPropertyValue('--mood-orange').trim()})`;
		const redColor = `hsl(${computedStyles.getPropertyValue('--mood-red').trim()})`;
		const textColor = `hsl(${computedStyles.getPropertyValue('--foreground').trim()})`;

		const chartData = {
			labels: ['😊 Très bien', '😐 Neutre', '😕 Moyen', '😞 Pas bien'],
			datasets: [
				{
					label: 'Nombre de votes',
					data: [moodCounts.vert, moodCounts.bleu, moodCounts.orange, moodCounts.rouge],
					backgroundColor: [greenColor, blueColor, orangeColor, redColor],
					borderColor: 'hsl(var(--card))',
					borderWidth: 4,
					hoverOffset: 15
				}
			]
		};

		if (chart) {
			chart.data = chartData;
			chart.update();
		} else {
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
										const total = context.dataset.data.reduce((a, b) => a + b, 0);
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
		}
	}

	function showToast(type: 'success' | 'error' | 'warn', message: string) {
		const baseOptions = {
			position: 'top-right',
			orderReversed: true,
			entryAnimation: 'windLeftIn',
			exitAnimation: 'windRightOut'
		};
		if (type === 'error') {
			toast?.({
				...baseOptions,
				message,
				showIcon: true,
				iconAnimation: 'jelly',
				iconTimingFunction: 'ease-in-out',
				iconBorderRadius: '50%',
				iconType: 'error'
			});
		} else {
			toast?.({ ...baseOptions, message, theme: 'dotted', showIcon: type === 'warn' });
		}
	}

	async function refreshData() {
		try {
			const [pollsRes, statsRes] = await Promise.all([
				fetch('/api/admin/polls'),
				fetch('/api/admin/stats')
			]);

			if (pollsRes.ok) {
				polls = (await pollsRes.json()).polls || [];
			} else {
				showToast('error', 'Erreur chargement des sondages');
			}
			if (statsRes.ok) {
				const stats = await statsRes.json();
				allVotes = stats.lineChartData || [];
			} else {
				showToast('error', 'Erreur chargement des stats');
			}
		} catch (error) {
			showToast('error', 'Erreur réseau');
		}
	}

	async function createPoll() {
		const res = await fetch('/api/admin/create-poll', { method: 'POST' });
		if (res.ok) {
			showToast('success', 'Sondage créé !');
			await refreshData();
		} else {
			showToast('error', 'Erreur création sondage');
		}
	}

	async function closePoll(pollId: string) {
		const res = await fetch('/api/admin/close-poll', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ pollId })
		});
		if (res.ok) {
			showToast('success', 'Sondage fermé.');
			await refreshData();
		} else {
			showToast('error', 'Erreur fermeture sondage');
		}
	}

	function copyLink(pollId: string) {
		const link = `${window.location.origin}/poll/${pollId}`;
		navigator.clipboard.writeText(link);
		showToast('success', 'Lien copié !');
	}

	function exportCSV() {
		const moodCounts = { vert: 0, bleu: 0, orange: 0, rouge: 0 };
		filteredVotes.forEach((v) => {
			const moodMap = { 4: 'vert', 3: 'bleu', 2: 'orange', 1: 'rouge' };
			const mood = moodMap[v.value];
			if (mood) moodCounts[mood]++;
		});

		const header = 'Humeur,Nombre de votes\n';
		const rows = [
			`Très bien,${moodCounts.vert}`,
			`Neutre,${moodCounts.bleu}`,
			`Moyen,${moodCounts.orange}`,
			`Pas bien,${moodCounts.rouge}`
		].join('\n');

		const csv = header + rows;
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const link = document.createElement('a');
		const url = URL.createObjectURL(blob);
		link.setAttribute('href', url);
		link.setAttribute(
			'download',
			`repartition_humeurs_${selectedPeriod}jours_${new Date().toISOString().split('T')[0]}.csv`
		);
		link.click();
		URL.revokeObjectURL(url);
		showToast('success', 'Export CSV téléchargé !');
	}
</script>

<svelte:head>
	<title>Dashboard Admin</title>
</svelte:head>

<div class="min-h-screen bg-background">
	<div class="p-4 md:p-8">
		<div class="mx-auto max-w-7xl">
			<div class="mb-8 md:mb-12">
				<div class="mb-3 flex items-center gap-3">
					<div class="h-12 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50"></div>
					<h1 class="text-4xl font-bold text-foreground md:text-5xl">Dashboard Admin</h1>
				</div>
				<p class="pl-6 text-muted-foreground">
					Bienvenue, <span class="font-semibold text-foreground"
						>{data.session?.user?.name ?? 'Admin'}</span
					>
				</p>
			</div>

			<div class="grid gap-6">
				<Card.Root class="overflow-hidden border shadow-lg">
					<Card.Header class="border-b border-border bg-card">
						<div class="flex flex-wrap items-center justify-between gap-4">
							<Card.Title class="flex items-center gap-2 text-2xl text-card-foreground">
								<span>📊</span>
								Répartition des Humeurs
							</Card.Title>
							<div class="flex flex-wrap items-center gap-2">
								<div
									class="flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5"
								>
									<Calendar class="h-4 w-4 text-muted-foreground" />
									{#each periods as period}
										<button
											type="button"
											on:click={() => (selectedPeriod = period.value)}
											class="rounded-md px-3 py-1.5 text-sm font-medium transition-all {selectedPeriod ===
											period.value
												? 'bg-primary text-primary-foreground shadow-sm'
												: 'text-foreground hover:bg-background'}"
										>
											{period.label}
										</button>
									{/each}
								</div>
								<button
									type="button"
									on:click={exportCSV}
									disabled={filteredVotes.length === 0}
									class="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
								>
									<Download class="h-4 w-4" />
									CSV
								</button>
							</div>
						</div>
					</Card.Header>
					<Card.Content class="h-[450px] bg-card p-8">
						<canvas bind:this={canvasElement}></canvas>
					</Card.Content>
				</Card.Root>

				<CreatePollCard onCreatePoll={createPoll} />
				<PollsTable {polls} onCopyLink={copyLink} onClosePoll={closePoll} />
			</div>
		</div>
	</div>
</div>
