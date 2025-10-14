<script lang="ts">
	import PollRow from './PollRow.svelte';
	export let polls: any[];
	export let onCopyLink: (id: string) => void;
	export let onClosePoll: (id: string) => Promise<void>;
</script>

<div class="rounded-xl border bg-card text-card-foreground shadow-sm">
	<div class="flex flex-col space-y-1.5 p-6">
		<h3 class="font-semibold tracking-tight text-lg">Sondages ({polls.length})</h3>
	</div>
	<div class="p-6 pt-0">
        <div class="w-full overflow-auto">
            <table class="w-full caption-bottom text-sm">
                <thead class="[&_tr]:border-b">
                    <tr class="border-b transition-colors hover:bg-muted/50">
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">ID</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Statut</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Créé le</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Votes</th>
                        <th class="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Actions</th>
                    </tr>
                </thead>
                <tbody class="[&_tr:last-child]:border-0">
                    {#each polls as poll}
                        <PollRow {poll} {onCopyLink} {onClosePoll} />
                    {/each}
                </tbody>
            </table>
        </div>
	</div>
</div>
