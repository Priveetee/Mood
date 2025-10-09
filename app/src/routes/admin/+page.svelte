<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import DashboardHeader from '$lib/components/admin/DashboardHeader.svelte';
	import CreatePollCard from '$lib/components/admin/CreatePollCard.svelte';
	import PollsTable from '$lib/components/admin/PollsTable.svelte';

	export let data;

	let polls: any[] = [];
	let toast: any;
	let pollingInterval: ReturnType<typeof setInterval>;

	onMount(async () => {
		const module = await import('not-a-toast');
		toast = module.default;
		await import('not-a-toast/style.css');
		
		await loadPolls();
		pollingInterval = setInterval(loadPolls, 10000);
	});

	onDestroy(() => {
		clearInterval(pollingInterval);
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
		try {
			const response = await fetch('/api/admin/polls');
			if (response.ok) {
				polls = (await response.json()).polls || [];
			} else {
				showToast('error', 'Erreur de chargement des sondages');
			}
		} catch (error) {
			showToast('error', 'Erreur réseau');
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
			headers: { 'Content-Type': 'application/json' },
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
</script>

<svelte:head>
	<title>Dashboard Admin</title>
</svelte:head>

<div class="p-8">
	<div class="mx-auto max-w-7xl">
		<DashboardHeader userName={data.session?.user?.name ?? 'Admin'} />

		<div class="grid gap-6">
			<CreatePollCard onCreatePoll={createPoll} />
			<PollsTable polls={polls} onCopyLink={copyLink} onClosePoll={closePoll} />
		</div>
	</div>
</div>
