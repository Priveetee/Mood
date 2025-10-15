<script lang="ts">
	import { ArrowLeft } from 'lucide-svelte';
	import {
		Chart,
		Title,
		Tooltip,
		Legend,
		BarElement,
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		TimeScale
	} from 'chart.js';
	import 'chartjs-adapter-date-fns';
	import BarChart from '$lib/components/admin/BarChart.svelte';
	import LineChart from '$lib/components/admin/LineChart.svelte';

	Chart.register(
		Title,
		Tooltip,
		Legend,
		BarElement,
		CategoryScale,
		LinearScale,
		PointElement,
		LineElement,
		TimeScale
	);

	let { data } = $props();
	const { campaign } = data;

	const allVotes = campaign.polls.flatMap((poll) => poll.votes);

	const moodValueMap: { [key: string]: number } = { vert: 4, bleu: 3, orange: 2, rouge: 1 };

	const barChartDataCounts = { vert: 0, bleu: 0, orange: 0, rouge: 0 };
	allVotes.forEach((vote) => {
		const mood = vote.mood as keyof typeof barChartDataCounts;
		if (mood in barChartDataCounts) {
			barChartDataCounts[mood]++;
		}
	});

	const barChartData = {
		labels: ['Très bien', 'Neutre', 'Moyen', 'Pas bien'],
		datasets: [
			{
				label: 'Nombre de votes',
				data: [
					barChartDataCounts.vert,
					barChartDataCounts.bleu,
					barChartDataCounts.orange,
					barChartDataCounts.rouge
				],
				backgroundColor: [
					'hsl(var(--mood-green))',
					'hsl(var(--mood-blue))',
					'hsl(var(--mood-orange))',
					'hsl(var(--mood-red))'
				]
			}
		]
	};

	const barChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: { legend: { display: false } },
		scales: {
			y: { beginAtZero: true, ticks: { stepSize: 1 } }
		}
	};

	const lineChartRawData = allVotes.map((vote) => ({
		x: new Date(vote.createdAt).getTime(),
		y: moodValueMap[vote.mood] || 0
	}));

	const lineChartData = {
		datasets: [
			{
				label: "Tendance de l'humeur",
				data: lineChartRawData,
				borderColor: 'hsl(var(--primary))',
				tension: 0.1
			}
		]
	};

	const lineChartOptions = {
		responsive: true,
		maintainAspectRatio: false,
		plugins: { legend: { display: false } },
		scales: {
			x: { type: 'time', time: { unit: 'day' } },
			y: { min: 1, max: 4, ticks: { stepSize: 1 } }
		}
	};
</script>

<svelte:head>
	<title>Résultats: {campaign.name}</title>
</svelte:head>

<div class="min-h-screen bg-background p-4 md:p-8">
	<div class="mx-auto max-w-7xl">
		<a
			href="/admin"
			class="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Retour au Dashboard
		</a>

		<div class="mb-8">
			<h1 class="text-4xl font-bold">Résultats Globaux</h1>
			<p class="text-muted-foreground">Campagne: <span class="font-semibold">{campaign.name}</span></p>
		</div>

		<div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
			<div class="rounded-xl border bg-card text-card-foreground shadow-sm">
				<div class="p-6">
					<h3 class="font-semibold">Répartition des Humeurs</h3>
				</div>
				<div class="h-[350px] p-6 pt-0">
					<BarChart data={barChartData} options={barChartOptions} />
				</div>
			</div>
			<div class="rounded-xl border bg-card text-card-foreground shadow-sm">
				<div class="p-6">
					<h3 class="font-semibold">Tendance au Fil du Temps</h3>
				</div>
				<div class="h-[350px] p-6 pt-0">
					<LineChart data={lineChartData} options={lineChartOptions} />
				</div>
			</div>
		</div>
	</div>
</div>
