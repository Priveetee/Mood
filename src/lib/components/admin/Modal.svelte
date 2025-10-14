<script lang="ts">
	import { createEventDispatcher, onMount, onDestroy } from 'svelte';

	export let show: boolean;
	export let title: string;

	const dispatch = createEventDispatcher();

	function closeModal() {
		dispatch('close');
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			closeModal();
		}
	}

	onMount(() => {
		window.addEventListener('keydown', handleKeydown);
		return () => {
			window.removeEventListener('keydown', handleKeydown);
		};
	});
</script>

{#if show}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
		onclick={closeModal}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<div class="w-full max-w-md rounded-xl bg-card text-card-foreground shadow-xl">
			<div class="flex items-center justify-between border-b p-4">
				<h3 id="modal-title" class="text-lg font-semibold">{title}</h3>
				<button onclick={closeModal} class="rounded-full p-1 transition-colors hover:bg-muted">
					&times;
				</button>
			</div>
			<div class="p-6">
				<slot />
			</div>
		</div>
	</div>
{/if}
