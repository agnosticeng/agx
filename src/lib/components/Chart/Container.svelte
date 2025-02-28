<script lang="ts">
	import type { ColumnDescriptor } from '$lib/olap-engine';
	import type { ChartSettingsType } from '@agnosticeng/dv';

	import { Chart } from '@agnosticeng/dv';
	import Settings from './Settings.svelte';

	let {
		data,
		columns
	}: {
		data: Array<{ [key: string]: any }>;
		columns: Array<ColumnDescriptor>;
	} = $props();

	function setDefaultSettings() {
		const candleColumns = ['open', 'close', 'low', 'high'];

		const dateColumn = columns.find((col) => col.type.toLowerCase().includes('date'))?.name;
		const otherColumns = columns
			.filter((col) => !col.type.toLowerCase().includes('date'))
			.map((col) => col.name);

		const hasCandleColumns = candleColumns.some((col) =>
			columns.some((column) => column.name.toLowerCase() === col)
		);

		if (dateColumn && hasCandleColumns) {
			settings.type = 'candle';
			settings.x = dateColumn;
			settings.y = candleColumns;
			return;
		}

		if (dateColumn && otherColumns.length > 0) {
			settings.type = 'line';
			settings.x = dateColumn;
			settings.y = otherColumns;
			return;
		}
	}

	let settings = $state<ChartSettingsType>({
		type: 'line',
		x: '',
		y: []
	});

	$effect(() => {
		if (columns) {
			setDefaultSettings();
		}
	});

	$effect(() => {
		if (settings.x.length === 0 && settings.y.length === 0) {
			setDefaultSettings();
		}
	});
</script>

<Chart {data} {settings} />
<Settings bind:settings {columns} />
