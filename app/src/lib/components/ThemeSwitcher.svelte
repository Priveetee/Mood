<script lang="ts">
	import { Sun, Moon } from 'lucide-svelte';
	import { theme, toggleTheme } from '$lib/stores/theme';
</script>

<button
	type="button"
	on:click={toggleTheme}
	class="inline-flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium transition-all duration-300 hover:scale-110 hover:bg-accent focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:outline-none"
>
	<div class="transition-transform duration-500 {$theme === 'dark' ? 'rotate-180' : 'rotate-0'}">
		{#if $theme === 'light'}
			<Moon class="h-5 w-5" />
		{:else}
			<Sun class="h-5 w-5" />
		{/if}
	</div>
	<span class="sr-only">Toggle theme</span>
</button>
