<script lang="ts">
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

    const badgeClasses = {
        default: "bg-primary text-primary-foreground",
        destructive: "bg-destructive text-destructive-foreground"
    };
</script>

<tr class="border-b transition-colors hover:bg-muted/50">
	<td class="p-4 align-middle font-mono text-xs">
		{poll.id.substring(0, 12)}...
	</td>
	<td class="p-4 align-middle">
        <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors {badgeClasses[status.variant]}">
            {status.label}
        </div>
	</td>
	<td class="p-4 align-middle">{formatDate(poll.createdAt)}</td>
	<td class="p-4 align-middle">{poll._count.votes}</td>
	<td class="p-4 align-middle">
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
	</td>
</tr>
