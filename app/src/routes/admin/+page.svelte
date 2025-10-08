<script lang="ts">
	import { onMount } from 'svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Table from '$lib/components/ui/table';
	import { Badge } from '$lib/components/ui/badge';

	let polls: any[] = [];
	let toast: any;

	onMount(async () => {
		const module = await import('not-a-toast');
		toast = module.default;
		await import('not-a-toast/style.css');
		await loadPolls();
	});

	function showToast(type: 'success' | 'error', message: string) {
		const baseOptions = {
			position: 'top-right',
			orderReversed: true,
			entryAnimation: 'windLeftIn',
			exitAnimation: 'windRightOut'
		};
		if (type === 'error') {
			toast?.({
				...baseOptions,
				message,
				showIcon: true,
				iconAnimation: 'jelly',
				iconTimingFunction: 'ease-in-out',
				iconBorderRadius: '50%',
				iconType: 'error'
			});
		} else {
			toast?.({ ...baseOptions, message, theme: 'dotted' });
		}
	}

	async function loadPolls() {
		const res = await fetch('/api/admin/polls');
		if (res.ok) polls = (await res.json()).polls;
	}

	async function createPoll() {
		const res = await fetch('/api/admin/create-poll', { method: 'POST' });
		if (res.ok) {
			showToast('success', 'Sondage créé !');
			await loadPolls();
		} else {
			showToast('error', 'Erreur lors de la création.');
		}
	}

	async function closePoll(pollId: string) {
		const res = await fetch('/api/admin/close-poll', {
			method: 'POST',
			body: JSON.stringify({ pollId })
		});
		if (res.ok) {
			showToast('success', 'Sondage fermé.');
			await loadPolls();
		} else {
			showToast('error', 'Erreur lors de la fermeture.');
		}
	}

	function copyLink(pollId: string) {
		const link = `${window.location.origin}/poll/${pollId}`;
		navigator.clipboard.writeText(link);
		showToast('success', 'Lien copié !');
	}
</script>

<svelte:head>
	<title>Dashboard Admin</title>
</svelte:head>

<div class="p-8">
	<div class="mx-auto max-w-7xl">
		<div class="mb-8">
			<h1 class="text-4xl font-bold">Dashboard Admin</h1>
			<p class="text-muted-foreground">Bienvenue, Admin.</p>
		</div>

		<div class="grid gap-6">
			<Card.Root>
				<Card.Header>
					<Card.Title>Nouveau sondage</Card.Title>
				</Card.Header>
				<Card.Content>
					<button
						on:click={createPoll}
						class="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
					>
						+ Créer un sondage
					</button>
				</Card.Content>
			</Card.Root>

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
								<Table.Head>Votes</Table.Head>
								<Table.Head>Actions</Table.Head>
							</Table.Row>
						</Table.Header>
						<Table.Body>
							{#each polls as poll}
								<Table.Row>
									<Table.Cell class="font-mono text-xs">{poll.id}</Table.Cell>
									<Table.Cell>
										<Badge variant={poll.closed ? 'destructive' : 'default'}>
											{poll.closed ? 'Fermé' : 'Actif'}
										</Badge>
									</Table.Cell>
									<Table.Cell>{poll._count.votes}</Table.Cell>
									<Table.Cell class="flex gap-2">
										<button
											on:click={() => copyLink(poll.id)}
											class="inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm"
										>
											Copier le lien
										</button>
										{#if !poll.closed}
											<button
												on:click={() => closePoll(poll.id)}
												class="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-3 text-sm text-destructive-foreground"
											>
												Fermer
											</button>
										{/if}
									</Table.Cell>
								</Table.Row>
							{/each}
						</Table.Body>
					</Table.Root>
				</Card.Content>
			</Card.Root>
		</div>
	</div>
</div>
