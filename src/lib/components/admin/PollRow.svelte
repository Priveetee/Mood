<script lang="ts">
	import { Badge } from '$lib/components/ui/badge';
	import * as Table from '$lib/components/ui/table';

	export let poll: any;
	export let onCopyLink: (id: string) => void;
	export let onClosePoll: (id: string) => Promise<void>;

	function formatDate(date: string) {
		return new Date(date).toLocaleDateString('fr-FR', {
			day: '2-digit',
			month: '2-digit',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function getStatus() {
		if (poll.closed) return { label: 'Fermé', variant: 'destructive' as const };
		return { label: 'Actif', variant: 'default' as const };
	}

	$: status = getStatus();
</script>

<Table.Row>
	<Table.Cell class="font-mono text-xs">
		{poll.id.substring(0, 12)}...
	</Table.Cell>
	<Table.Cell>
		<Badge variant={status.variant}>{status.label}</Badge>
	</Table.Cell>
	<Table.Cell>{formatDate(poll.createdAt)}</Table.Cell>
	<Table.Cell>{poll._count.votes}</Table.Cell>
	<Table.Cell>
		<div class="flex items-center gap-2">
			<a
				href="/admin/poll/{poll.id}"
				class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
			>
				Voir les résultats
			</a>
			<button
				type="button"
				on:click={() => onCopyLink(poll.id)}
				class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md border border-input bg-background px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground"
			>
				Copier le lien
			</button>
			{#if !poll.closed}
				<button
					type="button"
					on:click={() => onClosePoll(poll.id)}
					class="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-destructive px-3 text-sm font-medium text-destructive-foreground ring-offset-background transition-colors hover:bg-destructive/90"
				>
					Fermer
				</button>
			{/if}
		</div>
	</Table.Cell>
</Table.Row>
