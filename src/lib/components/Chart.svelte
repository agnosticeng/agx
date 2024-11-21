<script lang="ts">
	import type { CHResponse } from '$lib/query';
	import Line, { applyType, isValidType } from './charts/Line/Line.svelte';
	import { resolve_type } from './charts/utils';

	interface Props {
		response: CHResponse;
		x_axis: string;
		y_axis: string;
	}

	let { response, x_axis = $bindable(), y_axis = $bindable() }: Props = $props();

	const x_type = $derived(
		resolve_type(response?.meta.find((column) => column.name === x_axis)?.type ?? '')
	);

	const y_type = $derived(
		resolve_type(response?.meta.find((column) => column.name === y_axis)?.type ?? '')
	);
</script>

{#if response}
	<div class="ChartContainer">
		<div class="Chart">
			{#if x_axis && y_axis}
				{#if isValidType(x_type) && isValidType(y_type)}
					<Line
						data={response.data}
						x_accessor={(d) => applyType(d[x_axis], x_type)}
						y_accessor={(d) => applyType(d[y_axis], y_type)}
						x_label={x_axis}
						y_label={y_axis}
						x_format={(x) => {
							const value = x.valueOf();
							return x_type === 'date'
								? new Date(value).toLocaleString('en')
								: (x_type === 'integer' ? Math.round(value) : value).toLocaleString('en');
						}}
						y_format={(y) => {
							const value = y.valueOf();
							return y_type === 'date'
								? new Date(value).toLocaleString('en')
								: (y_type === 'integer' ? Math.round(value) : value).toLocaleString('en');
						}}
					/>
				{/if}
			{/if}
		</div>
		<div class="Actions">
			<label>
				y-axis:
				<select bind:value={y_axis}>
					<option value="">None</option>
					{#each response.meta as column}
						<option value={column.name}>{column.name}</option>
					{/each}
				</select>
			</label>
			<label>
				x-axis:
				<select bind:value={x_axis}>
					<option value="">None</option>
					{#each response.meta as column}
						<option value={column.name}>{column.name}</option>
					{/each}
				</select>
			</label>
		</div>
	</div>
{/if}

<style>
	div.ChartContainer {
		height: 100%;
		width: 100%;

		display: flex;
		flex-direction: column;

		& > .Chart {
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
