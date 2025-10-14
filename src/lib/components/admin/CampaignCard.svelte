<script lang="ts">
	import { Copy, MoreVertical, Users, BarChart3, FileText, Trash2, Mail } from 'lucide-svelte';

	export let campaign: any;

	const totalVotes = campaign.polls.reduce((sum: any, poll: any) => sum + poll._count.votes, 0);

	function copyAllLinks() {
		const links = campaign.polls
			.map((p: any) => `${window.location.origin}/poll/${p.id}`)
			.join('\n');
		navigator.clipboard.writeText(links);
		// Idéalement, on utiliserait le store de toasts ici.
		alert(`${campaign.polls.length} liens copiés dans le presse-papiers !`);
	}
</script>

<div
	class="rounded-2xl border bg-card text-card-foreground shadow-lg transition-all hover:shadow-xl"
>
	<div class="p-6">
		<div class="flex items-start justify-between">
			<div>
				<h3 class="text-2xl font-bold tracking-tight">{campaign.name}</h3>
				<p class="text-sm text-muted-foreground">
					Créée le {new Date(campaign.createdAt).toLocaleDateString('fr-FR')}
				</p>
			</div>
			<div class="flex items-center gap-2">
				<button
					on:click={copyAllLinks}
					class="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-muted"
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
					{totalVotes > 0 ? (totalVotes / campaign.polls.length).toFixed(1) : 0}
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
