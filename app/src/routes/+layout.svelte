<script lang="ts">
	import '../app.css';
	import ModeWatcher from '$lib/components/ModeWatcher.svelte';

	let { children } = $props();
</script>

<ModeWatcher />

{@render children?.()}
