<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';
	import * as Card from '$lib/components/ui/card';

	const pollId = $page.params.id;

	let selectedMood: string | null = null;
	let comment = '';
	let isSubmitting = false;
	let hasVoted = false;
	let toast: any;

	onMount(async () => {
		if (browser) {
			const module = await import('not-a-toast');
			toast = module.default;
			await import('not-a-toast/style.css');
		}
	});

	const moods = [
		{ value: 'vert', emoji: '😊', label: 'Très bien' },
		{ value: 'bleu', emoji: '😐', label: 'Neutre' },
		{ value: 'orange', emoji: '😕', label: 'Moyen' },
		{ value: 'rouge', emoji: '😞', label: 'Pas bien' }
	];

	function showToast(type: 'success' | 'warn' | 'error', message: string) {
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
			toast?.({
				...baseOptions,
				message,
				theme: 'dotted',
				showIcon: type === 'warn'
			});
		}
	}

	async function handleSubmit() {
		if (!selectedMood) {
			showToast('warn', 'Veuillez sélectionner une humeur.');
			return;
		}

		isSubmitting = true;

		// On simule un appel API qui réussit
		await new Promise((resolve) => setTimeout(resolve, 1000));
		showToast('success', 'Merci pour votre participation !');

		isSubmitting = false;
		hasVoted = true;
	}
</script>

<svelte:head>
	<title>Votez pour votre humeur</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4">
	<div class="w-full max-w-2xl transition-all duration-500">
		{#if !hasVoted}
			<Card.Root>
				<Card.Header class="text-center">
					<Card.Title class="text-4xl font-bold">Comment vous sentez-vous ?</Card.Title>
					<Card.Description class="mt-2">
						Votre avis est important. Sélectionnez votre humeur du moment.
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
						{#each moods as mood}
							{@const isSelected = selectedMood === mood.value}
							<button
								type="button"
								on:click={() => (selectedMood = mood.value)}
								class="group flex flex-col items-center justify-center rounded-lg border p-6 text-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring {isSelected
									? 'border-transparent bg-primary text-primary-foreground'
									: 'bg-muted/50 text-muted-foreground hover:bg-accent'}"
							>
								<div
									class="mb-3 text-5xl transition-transform duration-300 {isSelected
										? 'scale-110'
										: 'group-hover:scale-110'}"
								>
									{mood.emoji}
								</div>
								<div class="text-sm font-medium">{mood.label}</div>
							</button>
						{/each}
					</div>

					<div class="mb-8">
						<label for="comment" class="mb-2 block text-sm font-medium">
							Laisser un commentaire (optionnel)
						</label>
						<textarea
							id="comment"
							bind:value={comment}
							placeholder="Partagez plus de détails ici..."
							rows="3"
							class="w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						></textarea>
					</div>

					<button
						type="button"
						on:click={handleSubmit}
						disabled={!selectedMood || isSubmitting}
						class="inline-flex h-12 w-full items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-base font-semibold text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
					>
						{isSubmitting ? 'Envoi en cours...' : 'Envoyer mon vote'}
					</button>
				</Card.Content>
			</Card.Root>
		{:else}
			<Card.Root class="p-12 text-center">
				<div class="mb-4 text-6xl animate-bounce">🎉</div>
				<Card.Title class="mb-3 text-3xl font-bold">Merci !</Card.Title>
				<Card.Description class="text-lg">
					Votre vote a été enregistré avec succès.
				</Card.Description>
			</Card.Root>
		{/if}
	</div>
</div>

<style>
	@keyframes bounce {
		0%,
		100% {
			transform: translateY(-25%);
			animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
		}
		50% {
			transform: translateY(0);
			animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
		}
	}
	.animate-bounce {
		animation: bounce 1s infinite;
	}
</style>
