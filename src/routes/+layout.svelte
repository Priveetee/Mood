<script lang="ts">
	import '../app.css';
	import 'not-a-toast/style.css';
	import ModeWatcher from '$lib/components/ModeWatcher.svelte';
	import ThemeSwitcher from '$lib/components/ThemeSwitcher.svelte';

	let { children } = $props();
</script>

<ModeWatcher />

<header class="fixed top-6 right-6 z-50">
	<div class="glass rounded-xl p-1 shadow-lg">
		<ThemeSwitcher />
	</div>
</header>

<main>
	{@render children?.()}
</main>
