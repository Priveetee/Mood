<script lang="ts">
	import '../app.css';
	import ModeWatcher from '$lib/components/ModeWatcher.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

	let { children } = $props();
</script>

<ModeWatcher />

<header class="absolute right-4 top-4 z-50">
	<ThemeSwitcher />
</header>

<main>
	{@render children?.()}
</main>
