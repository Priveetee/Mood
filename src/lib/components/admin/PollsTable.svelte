<script lang="ts">
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import PollRow from './PollRow.svelte';

	export let polls: any[];
	export let onCopyLink: (id: string) => void;
	export let onClosePoll: (id: string) => Promise<void>;
</script>

<Card.Root>
	<Card.Header>
		<Card.Title>Sondages ({polls.length})</Card.Title>
	</Card.Header>
	<Card.Content>
		<Table.Root>
			<Table.Header>
				<Table.Row>
					<Table.Head>ID</Table.Head>
					<Table.Head>Statut</Table.Head>
					<Table.Head>Créé le</Table.Head>
					<Table.Head>Votes</Table.Head>
					<Table.Head>Actions</Table.Head>
				</Table.Row>
			</Table.Header>
			<Table.Body>
				{#each polls as poll}
					<PollRow {poll} {onCopyLink} {onClosePoll} />
				{/each}
			</Table.Body>
		</Table.Root>
	</Card.Content>
</Card.Root>
