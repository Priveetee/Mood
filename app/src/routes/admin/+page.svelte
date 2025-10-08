<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import PollsTable from '$lib/components/admin/PollsTable.svelte';
	import DashboardHeader from '$lib/components/admin/DashboardHeader.svelte';
	import CreatePollCard from '$lib/components/admin/CreatePollCard.svelte';
	import LineChart from '$lib/components/admin/LineChart.svelte';

	export let data;
	const { allVotes } = data;

	let polls: any[] = [];
	let toast: any;
	let loading = false;

	onMount(async () => {
		const module = await import('not-a-toast');
		toast = module.default;
		await import('not-a-toast/style.css');
		await loadPolls();
	});

	function showToast(type: 'success' | 'error', message: string) {
		toast?.({
			message,
			theme: 'dotted',
			position: 'top-right',
			orderReversed: true,
			entryAnimation: 'windLeftIn',
			exitAnimation: 'windRightOut'
		});
	}

	async function loadPolls() {
		const res = await fetch('/api/admin/polls');
		if (res.ok) {
			polls = (await res.json()).polls;
		} else {
			showToast('error', 'Erreur chargement des sondages');
		}
	}

	async function createPoll() {
		const res = await fetch('/api/admin/create-poll', { method: 'POST' });
		if (res.ok) {
			showToast('success', 'Sondage créé !');
			await loadPolls();
		} else {
			showToast('error', 'Erreur création sondage');
		}
	}

	async function closePoll(pollId: string) {
		const res = await fetch('/api/admin/close-poll', {
			method: 'POST',
			body: JSON.stringify({ pollId })
		});
		if (res.ok) {
			showToast('success', 'Sondage fermé.');
			await loadPolls();
		} else {
			showToast('error', 'Erreur fermeture sondage');
		}
	}

	function copyLink(pollId: string) {
		const link = `${window.location.origin}/poll/${pollId}`;
		navigator.clipboard.writeText(link);
		showToast('success', 'Lien copié !');
	}

	const trendData = {
		labels: allVotes.map((v) => v.createdAt),
		datasets: [
			{
				label: 'Humeur (4=Très bien, 1=Pas bien)',
				data: allVotes.map((v) => {
					if (v.mood === 'vert') return 4;
					if (v.mood === 'bleu') return 3;
					if (v.mood === 'orange') return 2;
					if (v.mood === 'rouge') return 1;
					return 0;
				}),
				borderColor: 'hsl(var(--primary))',
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

<div class="p-8">
	<div class="mx-auto max-w-7xl">
		<DashboardHeader />

		<div class="grid gap-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Tendance Globale</Card.Title>
				</Card.Header>
				<Card.Content class="h-[300px]">
					<LineChart data={trendData} options={trendOptions} />
				</Card.Content>
			</Card.Root>

			<CreatePollCard onCreatePoll={createPoll} />
			<PollsTable polls={polls} onCopyLink={copyLink} onClosePoll={closePoll} />
		</div>
	</div>
</div>
