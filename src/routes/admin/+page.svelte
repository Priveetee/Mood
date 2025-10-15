<script lang="ts">
	import CampaignCard from '$lib/components/admin/CampaignCard.svelte';
	import Modal from '$lib/components/admin/Modal.svelte';
	import { invalidateAll } from '$app/navigation';
	import { showToast } from '$lib/toast';

	let { data } = $props();

	let campaigns = $state(data.campaigns);

	$effect(() => {
		campaigns = data.campaigns;
	});

	let showCreateCampaignModal = $state(false);
	let newCampaignName = $state('');
	let isCreating = $state(false);

	async function createCampaign() {
		if (!newCampaignName || isCreating) return;
		isCreating = true;

		const response = await fetch('/api/admin/create-campaign', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ name: newCampaignName })
		});

		if (response.ok) {
			showCreateCampaignModal = false;
			newCampaignName = '';
			await invalidateAll();
			await showToast('success', 'La campagne a été créée avec succès.');
		} else {
			await showToast('error', 'Erreur lors de la création de la campagne.');
		}
		isCreating = false;
	}
</script>

<svelte:head>
	<title>Dashboard Admin</title>
</svelte:head>

<Modal title="Créer une nouvelle campagne" bind:show={showCreateCampaignModal}>
	<form onsubmit={createCampaign} class="flex flex-col gap-4">
		<label for="campaignName" class="text-sm font-medium">Nom de la campagne</label>
		<input
			id="campaignName"
			type="text"
			bind:value={newCampaignName}
			placeholder="Sondage Trimestriel Q4 2025"
			required
			class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
		/>
		<button
			type="submit"
			disabled={isCreating}
			class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
		>
			{isCreating ? 'Création...' : 'Créer la campagne'}
		</button>
	</form>
</Modal>

<div class="min-h-screen bg-background">
	<div class="p-4 md:p-8">
		<div class="mx-auto max-w-7xl">
			<div class="mb-8 flex items-center justify-between md:mb-12">
				<div>
					<div class="mb-3 flex items-center gap-3">
						<div class="h-12 w-1 rounded-full bg-gradient-to-b from-primary to-primary/50"></div>
						<h1 class="text-4xl font-bold text-foreground md:text-5xl">Dashboard</h1>
					</div>
					<p class="pl-6 text-muted-foreground">
						Bienvenue, <span class="font-semibold text-foreground"
							>{data.session?.user?.name ?? 'Admin'}</span
						>
					</p>
				</div>
				<div>
					<button
						onclick={() => (showCreateCampaignModal = true)}
						class="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
					>
						+ Nouvelle Campagne
					</button>
				</div>
			</div>

			<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
				{#each campaigns as campaign (campaign.id)}
					<CampaignCard {campaign} />
				{:else}
					<div
						class="flex md:col-span-2 lg:col-span-3 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center"
					>
						<div class="mb-4 text-5xl">📂</div>
						<h3 class="text-xl font-semibold">Aucune campagne trouvée</h3>
						<p class="mt-1 text-muted-foreground">
							Cliquez sur "Nouvelle Campagne" pour commencer à sonder vos équipes.
						</p>
					</div>
				{/each}
			</div>
		</div>
	</div>
</div>
