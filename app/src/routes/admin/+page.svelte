<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import PollsTable from '$lib/components/admin/PollsTable.svelte';
	import CreatePollCard from '$lib/components/admin/CreatePollCard.svelte';
	import LineChart from '$lib/components/admin/LineChart.svelte';

	let polls: any[] = [];
	let allVotes: any[] = [];
	let toast: any;
	let pollingInterval: ReturnType<typeof setInterval>;
	let primaryColor = 'hsl(240 5% 96.1%)';

	onMount(async () => {
		const module = await import('not-a-toast');
		toast = module.default;
		await import('not-a-toast/style.css');
		
		await refreshData();
		pollingInterval = setInterval(refreshData, 10000);

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
			toast?.({ ...baseOptions, message, showIcon: true, iconType: 'error' });
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
				data: allVotes.map((v) => v.value),
				borderColor: primaryColor,
				tension: 0.1
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
