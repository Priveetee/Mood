<script lang="ts">
	import { ArrowLeft, Power } from 'lucide-svelte';
	import Modal from '$lib/components/admin/Modal.svelte';
	import { invalidateAll } from '$app/navigation';
	import { showToast } from '$lib/toast';

	let { data } = $props();
	let campaign = $state(data.campaign);

	$effect(() => {
		campaign = data.campaign;
	});

	let showAddManagerModal = $state(false);
	let newManagerName = $state('');
	let isCreating = $state(false);
	let closingPollId = $state<string | null>(null);

	async function addManager() {
		if (!newManagerName || isCreating) return;
		isCreating = true;

		const response = await fetch('/api/admin/add-poll', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				campaignId: campaign.id,
				managerName: newManagerName
			})
		});

		if (response.ok) {
			showAddManagerModal = false;
			newManagerName = '';
			await invalidateAll();
			await showToast('success', `Sondage pour ${newManagerName} créé.`);
		} else {
			await showToast('error', "Erreur lors de l'ajout du manager.");
		}
		isCreating = false;
	}

	function copyLink(pollId: string) {
		const link = `${window.location.origin}/poll/${pollId}`;
		navigator.clipboard.writeText(link);
		showToast('success', 'Lien copié !');
	}

	async function closePoll(pollId: string) {
		if (closingPollId) return;
		closingPollId = pollId;

		const response = await fetch('/api/admin/close-poll', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ pollId })
		});

		if (response.ok) {
			await invalidateAll();
			await showToast('success', 'Le sondage a été fermé.');
		} else {
			await showToast('error', 'Erreur lors de la fermeture du sondage.');
		}
		closingPollId = null;
	}
</script>

<svelte:head>
	<title>Campagne: {campaign.name}</title>
</svelte:head>

<Modal title="Ajouter un manager" bind:show={showAddManagerModal}>
	<form onsubmit={addManager} class="flex flex-col gap-4">
		<label for="managerName" class="text-sm font-medium">Nom du manager</label>
		<input
			id="managerName"
			type="text"
			bind:value={newManagerName}
			placeholder="Jean Dupont"
			required
			class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
		/>
		<button
			type="submit"
			disabled={isCreating}
			class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:opacity-50"
		>
			{isCreating ? 'Ajout en cours...' : 'Ajouter et créer le sondage'}
		</button>
	</form>
</Modal>

<div class="min-h-screen bg-background p-4 md:p-8">
	<div class="mx-auto max-w-7xl">
		<a
			href="/admin"
			class="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
		>
			<ArrowLeft class="h-4 w-4" />
			Retour au Dashboard
		</a>

		<div class="mb-8 flex items-center justify-between">
			<div>
				<h1 class="text-4xl font-bold">{campaign.name}</h1>
				<p class="text-muted-foreground">
					{campaign.polls.length} sondage(s) pour cette campagne.
				</p>
			</div>
			<button
				onclick={() => (showAddManagerModal = true)}
				class="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-base font-medium text-primary-foreground transition-colors hover:bg-primary/90"
			>
				+ Ajouter un Manager
			</button>
		</div>

		<div class="rounded-xl border bg-card text-card-foreground shadow-sm">
			<div class="w-full overflow-auto">
				<table class="w-full caption-bottom text-sm">
					<thead class="[&_tr]:border-b">
						<tr class="border-b transition-colors hover:bg-muted/50">
							<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Manager
							</th>
							<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Statut
							</th>
							<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Votes
							</th>
							<th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
								Actions
							</th>
						</tr>
					</thead>
					<tbody class="[&_tr:last-child]:border-0">
						{#each campaign.polls as poll (poll.id)}
							<tr class="border-b transition-colors hover:bg-muted/50">
								<td class="p-4 align-middle font-medium">{poll.managerName}</td>
								<td class="p-4 align-middle">
									{#if poll.closed}
										<div
											class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-destructive text-destructive-foreground"
										>
											Fermé
										</div>
									{:else}
										<div
											class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors bg-primary text-primary-foreground"
										>
											Actif
										</div>
									{/if}
								</td>
								<td class="p-4 align-middle">{poll._count.votes}</td>
								<td class="p-4 align-middle">
									<div class="flex items-center gap-2">
										<a
											href="/admin/poll/{poll.id}"
											class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium"
										>
											Résultats
										</a>
										<button
											type="button"
											onclick={() => copyLink(poll.id)}
											class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium"
										>
											Copier
										</button>
										{#if !poll.closed}
											<button
												type="button"
												onclick={() => closePoll(poll.id)}
												disabled={closingPollId === poll.id}
												class="inline-flex h-9 w-9 items-center justify-center whitespace-nowrap rounded-md bg-destructive text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
											>
												<Power class="h-4 w-4" />
											</button>
										{/if}
									</div>
								</td>
							</tr>
						{:else}
							<tr>
								<td colspan="4" class="p-8 text-center text-muted-foreground">
									Aucun sondage n'a encore été ajouté à cette campagne.
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</div>
</div>
