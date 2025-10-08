<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	const pollId = $page.params.id;

	let selectedMood = '';
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
		{ value: 'vert', emoji: '😊', label: 'Très bien', color: 'bg-green-500' },
		{ value: 'bleu', emoji: '😐', label: 'Neutre', color: 'bg-blue-500' },
		{ value: 'orange', emoji: '😕', label: 'Moyen', color: 'bg-orange-500' },
		{ value: 'rouge', emoji: '😞', label: 'Pas bien', color: 'bg-red-500' }
	];

	async function handleSubmit() {
		if (!selectedMood) {
			toast?.({
				message: 'Veuillez sélectionner une humeur',
				theme: 'warningAlert',
				iconType: 'warn',
				showIcon: true
			});
			return;
		}

		isSubmitting = true;

		try {
			const response = await fetch('/api/vote', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ pollId, mood: selectedMood, comment })
			});

			const data = await response.json();

			if (response.ok) {
				hasVoted = true;
				toast?.({
					message: 'Merci pour votre participation !',
					theme: 'glassmorphism',
					iconType: 'success',
					showIcon: true,
					duration: 4000
				});
			} else {
				toast?.({
					message: data.error || 'Une erreur est survenue',
					theme: 'neonGlow',
					iconType: 'error',
					showIcon: true
				});
			}
		} catch (error) {
			toast?.({
				message: 'Erreur de connexion au serveur',
				theme: 'neonGlow',
				iconType: 'error',
				showIcon: true
			});
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4"
>
	<div class="w-full max-w-2xl">
		{#if !hasVoted}
			<div class="rounded-3xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-xl">
				<h1 class="mb-2 text-center text-4xl font-bold text-white">Comment vous sentez-vous ?</h1>
				<p class="mb-8 text-center text-white/70">
					Votre avis compte. Sélectionnez votre humeur du moment.
				</p>

				<div class="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
					{#each moods as mood}
						<button
							type="button"
							on:click={() => (selectedMood = mood.value)}
							class="group relative overflow-hidden rounded-2xl p-6 transition-all duration-300 {selectedMood ===
							mood.value
								? 'scale-105 shadow-2xl ring-4 ring-white'
								: 'hover:scale-105'} {mood.color}"
						>
							<div class="mb-2 text-5xl">{mood.emoji}</div>
							<div class="text-sm font-semibold text-white">{mood.label}</div>
						</button>
					{/each}
				</div>

				<div class="mb-6">
					<label for="comment" class="mb-2 block text-sm font-medium text-white/80">
						Commentaire (optionnel)
					</label>
					<textarea
						id="comment"
						bind:value={comment}
						placeholder="Partagez-nous en plus..."
						rows="3"
						class="w-full resize-none rounded-xl border border-white/20 bg-white/10 px-4 py-3 text-white placeholder-white/40 focus:ring-2 focus:ring-purple-500 focus:outline-none"
					></textarea>
				</div>

				<button
					on:click={handleSubmit}
					disabled={!selectedMood || isSubmitting}
					class="w-full rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-4 font-bold text-white shadow-lg transition-all duration-300 hover:from-purple-600 hover:to-pink-600 hover:shadow-2xl disabled:cursor-not-allowed disabled:from-gray-500 disabled:to-gray-600"
				>
					{isSubmitting ? 'Envoi en cours...' : 'Envoyer mon vote'}
				</button>
			</div>
		{:else}
			<div
				class="rounded-3xl border border-white/20 bg-white/10 p-12 text-center shadow-2xl backdrop-blur-xl"
			>
				<div class="mb-4 text-6xl">🎉</div>
				<h2 class="mb-3 text-3xl font-bold text-white">Merci !</h2>
				<p class="text-lg text-white/80">Votre vote a été enregistré avec succès.</p>
			</div>
		{/if}
	</div>
</div>
