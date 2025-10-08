<script lang="ts">
	import { onMount } from 'svelte';
	import DashboardHeader from '$lib/components/admin/DashboardHeader.svelte';
	import CreatePollCard from '$lib/components/admin/CreatePollCard.svelte';
	import PollsTable from '$lib/components/admin/PollsTable.svelte';

	export let data;

	let polls: any[] = [];
	let loading = false;
	let toast: any;

	onMount(async () => {
		const module = await import('not-a-toast');
		toast = module.default;
		await import('not-a-toast/style.css');
		await loadPolls();
	});

	async function loadPolls() {
		loading = true;
		try {
			const response = await fetch('/api/admin/polls');
			const result = await response.json();
			polls = result.polls || [];
		} catch (error) {
			showToast('Erreur lors du chargement', 'error');
		} finally {
			loading = false;
		}
	}

	async function createPoll() {
		loading = true;
		try {
			const response = await fetch('/api/admin/create-poll', { method: 'POST' });
			if (response.ok) {
				showToast('Sondage créé avec succès !', 'success');
				await loadPolls();
			}
		} catch (error) {
			showToast('Erreur lors de la création', 'error');
		} finally {
			loading = false;
		}
	}

	async function closePoll(pollId: string) {
		try {
			const response = await fetch('/api/admin/close-poll', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pollId })
			});
			if (response.ok) {
				showToast('Sondage fermé', 'success');
				await loadPolls();
			}
		} catch (error) {
			showToast('Erreur', 'error');
		}
	}

	function copyLink(pollId: string) {
		const link = `${window.location.origin}/poll/${pollId}`;
		navigator.clipboard.writeText(link);
		showToast('Lien copié !', 'success');
	}

	function showToast(message: string, type: 'success' | 'error') {
		toast?.({
			message,
			theme: type === 'success' ? 'glassmorphism' : 'neonGlow',
			iconType: type,
			showIcon: true,
			duration: type === 'success' ? 2000 : 4000
		});
	}
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
	<div class="mx-auto max-w-7xl">
		<DashboardHeader />

		<div class="grid gap-6">
			<CreatePollCard onCreatePoll={createPoll} {loading} />
			<PollsTable {polls} onCopyLink={copyLink} onClosePoll={closePoll} />
		</div>
	</div>
</div>
