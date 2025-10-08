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
		if (poll.expiresAt && new Date(poll.expiresAt) < new Date()) {
			return { label: 'Expiré', variant: 'secondary' as const };
		}
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
		<div class="flex gap-2">
			<button
				type="button"
				on:click={() => onCopyLink(poll.id)}
				class="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-sm font-medium whitespace-nowrap ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
			>
				Copier le lien
			</button>
			{#if !poll.closed}
				<button
					type="button"
					on:click={() => onClosePoll(poll.id)}
					class="text-destructive-foreground inline-flex h-9 items-center justify-center rounded-md bg-destructive px-3 text-sm font-medium whitespace-nowrap ring-offset-background transition-colors hover:bg-destructive/90 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50"
				>
					Fermer
				</button>
			{/if}
		</div>
	</Table.Cell>
</Table.Row>
