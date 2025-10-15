<script lang="ts">
	import { Copy, BarChart3 } from 'lucide-svelte';
	import Modal from '$lib/components/admin/Modal.svelte';
	import { showToast } from '$lib/toast';

	let { campaign }: { campaign: any } = $props();

	let showLinksModal = $state(false);

	const totalVotes = campaign.polls.reduce((sum: any, poll: any) => sum + poll._count.votes, 0);

	function copyAllLinksToClipboard() {
		const links = campaign.polls
			.map((p: any) => `${p.managerName}: ${window.location.origin}/poll/${p.id}`)
			.join('\n');
		navigator.clipboard.writeText(links);
		showToast('success', `${campaign.polls.length} liens copiés dans le presse-papiers !`);
		showLinksModal = false;
	}
</script>

<Modal title="Liens de la campagne : {campaign.name}" bind:show={showLinksModal}>
	<div class="flex flex-col gap-4">
		<p class="text-sm text-muted-foreground">
			Voici la liste de tous les liens de sondage uniques pour cette campagne.
		</p>
		<div class="max-h-64 overflow-y-auto rounded-md border bg-muted/50 p-3">
			{#each campaign.polls as poll}
				<div class="mb-2">
					<p class="font-semibold text-foreground">{poll.managerName}</p>
					<p class="font-mono text-xs text-muted-foreground">
						{window.location.origin}/poll/{poll.id}
					</p>
				</div>
			{:else}
				<p class="text-sm text-muted-foreground">Aucun sondage dans cette campagne.</p>
			{/each}
		</div>
		<button
			onclick={copyAllLinksToClipboard}
			class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground"
		>
			Copier tous les liens
		</button>
	</div>
</Modal>

<div class="rounded-2xl border bg-card text-card-foreground shadow-lg transition-all hover:shadow-xl">
	<div class="p-6">
		<div class="flex items-start justify-between">
			<div>
				<h3 class="text-2xl font-bold tracking-tight">{campaign.name}</h3>
				<p class="text-sm text-muted-foreground">
					Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
				</p>
			</div>
			<div class="flex items-center gap-2">
				<a
					href="/admin/campaign/{campaign.id}/results"
					class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted"
					aria-label="Voir les résultats de la campagne"
				>
					<BarChart3 class="h-5 w-5" />
				</a>
				<button
					onclick={() => (showLinksModal = true)}
					class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted"
					aria-label="Copier tous les liens"
				>
					<Copy class="h-5 w-5" />
				</button>
			</div>
		</div>

		<div class="mt-6 flex items-center justify-between gap-4 rounded-lg bg-muted/50 p-4">
			<div class="text-center">
				<p class="text-2xl font-bold">{campaign.polls.length}</p>
				<p class="text-xs text-muted-foreground">Managers</p>
			</div>
			<div class="text-center">
				<p class="text-2xl font-bold">{totalVotes}</p>
				<p class="text-xs text-muted-foreground">Votes</p>
			</div>
			<div class="text-center">
				<p class="text-2xl font-bold">
					{campaign.polls.length > 0 ? (totalVotes / campaign.polls.length).toFixed(1) : 0}
				</p>
				<p class="text-xs text-muted-foreground">Votes/Manager</p>
			</div>
		</div>
	</div>
	<div class="flex justify-end border-t bg-muted/30 px-6 py-3">
		<a
			href="/admin/campaign/{campaign.id}"
			class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
		>
			Gérer la campagne
		</a>
	</div>
</div>
