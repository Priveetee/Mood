<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import Chart from 'chart.js/auto';

	let { data, options } = $props();
	let canvasElement: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		const ctx = canvasElement.getContext('2d');
		if (ctx) {
			chart = new Chart(ctx, {
				type: 'bar',
				data,
				options
			});
		}

		return () => {
			chart?.destroy();
		};
	});

	$effect(() => {
		if (chart) {
			chart.data = data;
			chart.options = options;
			chart.update();
		}
	});
</script>

<canvas bind:this={canvasElement}></canvas>
