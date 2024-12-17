<script lang="ts">
	import type { CHResponse } from '$lib/ch-engine';
	import { applyType, formatValue, isSupportedType, LineChart } from '$lib/components/charts/Line';
	import { BarChart } from './charts/Bar';

	interface Props {
		response: CHResponse;
		x_axis: string;
		y_axis: string;
		type: string;
	}

	let {
		response,
		x_axis = $bindable(),
		y_axis = $bindable(),
		type: chart_type = $bindable()
	}: Props = $props();

	const x_type = $derived(response.meta.find((c) => c.name === x_axis)?.type ?? '');
	const y_type = $derived(response.meta.find((c) => c.name === y_axis)?.type ?? '');
</script>

<article>
	<div class="Container">
		{#if x_axis && y_axis}
			{#if chart_type === 'line' && isSupportedType(x_type) && isSupportedType(y_type)}
				<LineChart
					data={response.data}
					x_accessor={(d) => applyType(d[x_axis], x_type)}
					y_accessor={(d) => applyType(d[y_axis], y_type)}
					x_format={(x) => formatValue(x, x_type)}
					y_format={(y) => formatValue(y, y_type)}
					x_label={x_axis}
					y_label={y_axis}
				/>
			{/if}
			{#if chart_type === 'bar' && isSupportedType(y_type)}
				<BarChart
					data={response.data}
					x_accessor={(d) => d[x_axis].toString()}
					y_accessor={(d) => applyType(d[y_axis], y_type)}
					x_format={(x) => formatValue(x, x_type)}
					y_format={(y) => formatValue(y, y_type)}
					x_label={x_axis}
					y_label={y_axis}
				/>
			{/if}
		{/if}
	</div>
	<div class="Actions">
		<label>
			chart type:
			<select bind:value={chart_type}>
				<option value="line">Line chart</option>
				<option value="bar">Bar chart</option>
			</select>
		</label>
		<label>
			x-axis:
			<select bind:value={x_axis}>
				<option value="">None</option>
				{#each response.meta as column}
					{#if isSupportedType(column.type)}
						<option value={column.name}>{column.name}</option>
					{/if}
				{/each}
			</select>
		</label>
		<label>
			y-axis:
			<select bind:value={y_axis}>
				<option value="">None</option>
				{#each response.meta as column}
					{#if isSupportedType(column.type)}
						<option value={column.name}>{column.name}</option>
					{/if}
				{/each}
			</select>
		</label>
	</div>
</article>

<style>
	article {
		height: 100%;
		width: 100%;

		/* Horizontal-Stack */
		display: flex;
		flex-direction: column;

		& > .Container {
			flex: 1;
			padding: 25px;
			overflow: hidden;
		}

		& > .Actions {
			padding: 7px 5px;

			& select {
				outline: none;
			}
		}
	}
</style>
