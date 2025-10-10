<script lang="ts">
	import { onMount } from 'svelte';
	import Chart from 'chart.js/auto';
	import 'chartjs-adapter-date-fns';

	let { data, options } = $props();
	let canvasElement: HTMLCanvasElement;
	let chart: Chart;

	onMount(() => {
		const ctx = canvasElement.getContext('2d');
		if (ctx) {
			chart = new Chart(ctx, {
				type: 'line',
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
