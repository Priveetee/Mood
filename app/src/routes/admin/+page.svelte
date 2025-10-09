<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import CreatePollCard from '$lib/components/admin/CreatePollCard.svelte';
	import PollsTable from '$lib/components/admin/PollsTable.svelte';
	import LineChart from '$lib/components/admin/LineChart.svelte';
	import * as Card from '$lib/components/ui/card';

	export let data;
	
	let polls: any[] = [];
	let allVotes: any[] = data.allVotes || [];
	let toast: any;
	let pollingInterval: ReturnType<typeof setInterval>;
	let primaryColor = 'hsl(240 5% 96.1%)'; // Couleur par défaut pour le SSR

	onMount(async () => {
		const module = await import('not-a-toast');
		toast = module.default;
		await import('not-a-toast/style.css');
		
		await refreshData();
		pollingInterval = setInterval(refreshData, 10000);

		// Lit la vraie couleur du thème une fois la page montée pour le graphique
		primaryColor = `hsl(${getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()})`;
	});

	onDestroy(() => {
		clearInterval(pollingInterval);
	});

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

	$: trendData = {
		labels: allVotes.map((v) => v.date),
		datasets: [
			{
				label: 'Humeur (4=Très bien, 1=Pas bien)',
				data: allVotes.map((v) => ({ x: v.date, y: v.value })),
				borderColor: primaryColor,
				tension: 0.1,
				fill: false
			}
		]
	};

	const trendOptions = {
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
	<title>Dashboard Admin</title>
</svelte:head>

<div class="p-8">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8">
			<h1 class="text-4xl font-bold">Dashboard Admin</h1>
			<p class="text-muted-foreground">Bienvenue, {data.session?.user?.name ?? 'Admin'}.</p>
		</div>

		<div class="grid gap-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Tendance Globale</Card.Title>
				</Card.Header>
				<Card.Content class="h-[300px]">
					{#key primaryColor + allVotes.length}
						<LineChart data={trendData} options={trendOptions} />
					{/key}
				</Card.Content>
			</Card.Root>

			<CreatePollCard onCreatePoll={createPoll} />
			<PollsTable polls={polls} onCopyLink={copyLink} onClosePoll={closePoll} />
		</div>
	</div>
</div>
