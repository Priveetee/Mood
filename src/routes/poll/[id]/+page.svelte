<script lang="ts">
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	export let data;
	const { poll } = data;

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
		{
			value: 'vert',
			emoji: '😊',
			label: 'Très bien',
			color: 'from-green-400 to-emerald-600',
			shadow: 'shadow-green-500/50'
		},
		{
			value: 'bleu',
			emoji: '😐',
			label: 'Neutre',
			color: 'from-blue-400 to-blue-600',
			shadow: 'shadow-blue-500/50'
		},
		{
			value: 'orange',
			emoji: '😕',
			label: 'Moyen',
			color: 'from-orange-400 to-orange-600',
			shadow: 'shadow-orange-500/50'
		},
		{
			value: 'rouge',
			emoji: '😞',
			label: 'Pas bien',
			color: 'from-red-400 to-red-600',
			shadow: 'shadow-red-500/50'
		}
	];
	function showToast(type: 'warn' | 'success' | 'error', message: string) {
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
			toast?.({ ...baseOptions, message, theme: 'dotted', showIcon: type === 'warn' });
		}
	}

	async function handleSubmit() {
		if (!selectedMood) {
			showToast('warn', 'Veuillez sélectionner une humeur.');
			return;
		}
		isSubmitting = true;
		try {
			const response = await fetch('/api/vote', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pollId: poll.id, mood: selectedMood, comment })
			});
			if (response.ok) {
				hasVoted = true;
			} else {
				const errorData = await response.json();
				showToast('error', errorData.error || 'Une erreur est survenue.');
			}
		} catch {
			showToast('error', 'Erreur de connexion au serveur.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Comment vous sentez-vous ?</title>
</svelte:head>

<div
	class="relative min-h-screen overflow-hidden bg-gradient-to-br from-background via-background to-muted/20"
>
	<div
		class="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"
	></div>
	<div class="relative flex min-h-screen items-center justify-center p-4">
		<div class="w-full max-w-2xl">
			{#if !hasVoted}
				<div class="glass-strong rounded-2xl shadow-2xl transition-all duration-500">
					<div class="p-8 text-center md:p-12">
						<div
							class="mb-4 inline-block rounded-full bg-gradient-to-br from-primary/20 to-primary/5 p-4"
						>
							<div class="text-6xl">💭</div>
						</div>
						<h1
							class="mb-3 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-bold text-transparent md:text-5xl"
						>
							Comment vous sentez-vous ?
						</h1>
						<p class="text-muted-foreground">
							Sondage: <span class="font-mono text-xs opacity-50">{poll.id}</span>
						</p>
					</div>

					<div class="px-8 pb-8 md:px-12">
						<div class="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
							{#each moods as mood}
								{@const isSelected = selectedMood === mood.value}
								<button
									type="button"
									onclick={() => (selectedMood = mood.value)}
									class="group relative overflow-hidden rounded-2xl border-2 p-8 text-center transition-all duration-300 focus:ring-4 focus:ring-primary/20 focus:outline-none {isSelected
										? `border-transparent bg-gradient-to-br ${mood.color} text-white shadow-xl ${mood.shadow} scale-105`
										: 'border-border bg-card hover:scale-105 hover:border-primary/30 hover:shadow-lg'}"
								>
									<div
										class="absolute inset-0 opacity-0 transition-opacity duration-300 {isSelected
											? 'animate-shimmer opacity-100'
											: ''}"
									></div>
									<div class="relative">
										<div
											class="mb-4 text-6xl transition-all duration-300 {isSelected
												? 'scale-110'
												: 'group-hover:scale-110'}"
										>
											{mood.emoji}
										</div>
										<div
											class="text-sm font-semibold {isSelected ? 'text-white' : 'text-foreground'}"
										>
											{mood.label}
										</div>
									</div>
								</button>
							{/each}
						</div>

						<div class="mb-8 space-y-3">
							<label for="comment" class="block text-sm font-semibold text-foreground">
								Laisser un commentaire (optionnel)
							</label>
							<textarea
								id="comment"
								bind:value={comment}
								placeholder="Partagez plus de détails ici..."
								rows="4"
								class="w-full resize-none rounded-xl border-2 border-border bg-background px-4 py-3 text-sm transition-all duration-200 placeholder:text-muted-foreground focus:border-primary/50 focus:ring-4 focus:ring-primary/10 focus:outline-none"
							></textarea>
						</div>

						<button
							type="button"
							onclick={handleSubmit}
							disabled={!selectedMood || isSubmitting}
							class="group relative h-14 w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary to-primary/90 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/40 focus:ring-4 focus:ring-primary/30 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
						>
							<div
								class="group-hover:animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
							></div>
							<span class="relative">
								{isSubmitting ? 'Envoi en cours...' : 'Envoyer mon vote'}
							</span>
						</button>
					</div>
				</div>
			{:else}
				<div class="glass-strong rounded-2xl p-16 text-center shadow-2xl">
					<div class="mb-6 inline-block">
						<div class="text-8xl">🎉</div>
					</div>
					<h2
						class="mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-4xl font-bold text-transparent"
					>
						Merci !
					</h2>
					<p class="text-lg text-muted-foreground">Votre vote a été enregistré avec succès.</p>
				</div>
			{/if}
		</div>
	</div>
</div>
