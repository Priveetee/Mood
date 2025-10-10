<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import { ArrowLeft } from 'lucide-svelte';
	import BarChart from '$lib/components/admin/BarChart.svelte';
	import LineChart from '$lib/components/admin/LineChart.svelte';
	import {
		Chart as ChartJS,
		Title,
		Tooltip,
		Legend,
		BarElement,
		CategoryScale,
		LinearScale,
		TimeScale
	} from 'chart.js';
	import 'chartjs-adapter-date-fns';

	export let data;
	const { stats } = data;

	ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale, TimeScale);

	const barChartData = {
		labels: stats?.barChartData.map((d) => d.mood) || [],
		datasets: [
			{
				label: 'Nombre de votes',
				data: stats?.barChartData.map((d) => d.votes) || [],
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

	const barChartOptions = {
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

	const lineChartData = {
		labels: stats?.lineChartData.map((d) => d.date) || [],
		datasets: [
			{
				label: 'Humeur (4=Très bien, 1=Pas bien)',
				data: stats?.lineChartData.map((d) => ({ x: d.date, y: d.value })) || [],
				borderColor: 'hsl(var(--primary))',
				tension: 0.1,
				fill: false
			}
		]
	};

	const lineChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: {
			legend: {
				display: false
			},
			title: {
				display: true,
				text: "Tendance de l'Humeur au Fil du Temps",
				color: 'hsl(var(--foreground))',
				font: {
					size: 18
				}
			}
		},
		scales: {
			x: {
				type: 'time',
				time: {
					unit: 'day',
					tooltipFormat: 'dd/MM/yyyy'
				},
				ticks: {
					color: 'hsl(var(--muted-foreground))'
				},
				grid: {
					color: 'hsl(var(--border))'
				}
			},
			y: {
				min: 1,
				max: 4,
				ticks: {
					stepSize: 1,
					color: 'hsl(var(--muted-foreground))'
				},
				grid: {
					color: 'hsl(var(--border))'
				}
			}
		}
	};
</script>

<svelte:head>
	<title>Dashboard Analytique</title>
</svelte:head>

<div class="p-4 md:p-8">
	<div class="mx-auto max-w-7xl">
		<a
			href="/admin"
			class="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Retour
		</a>

		<div class="mb-8">
			<h1 class="text-4xl font-bold">Dashboard Analytique</h1>
			<p class="text-muted-foreground">Vue d'ensemble de toutes les données.</p>
		</div>

		{#if stats}
			<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
				<Card.Root>
					<Card.Header>
						<Card.Title>Répartition Globale</Card.Title>
						<Card.Description>Distribution de toutes les humeurs enregistrées.</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="h-[300px]">
							<BarChart data={barChartData} options={barChartOptions} />
						</div>
					</Card.Content>
				</Card.Root>

				<Card.Root>
					<Card.Header>
						<Card.Title>Tendance de l'Humeur</Card.Title>
						<Card.Description>Évolution de l'humeur moyenne au fil du temps.</Card.Description>
					</Card.Header>
					<Card.Content>
						<div class="h-[300px]">
							<LineChart data={lineChartData} options={lineChartOptions} />
						</div>
					</Card.Content>
				</Card.Root>
			</div>
		{:else}
			<p class="text-muted-foreground">Impossible de charger les statistiques.</p>
		{/if}
	</div>
</div>
