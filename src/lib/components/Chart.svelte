<script lang="ts">
	import type { CHResponse } from '$lib/query';
	import Line, { applyType, isValidType } from './charts/Line.svelte';
	import { resolve_type } from './charts/utils';

	interface Props {
		response: CHResponse;
	}

	let { response }: Props = $props();

	let y_axis = $state<string>('');
	let x_axis = $state<string>('');

	const x_type = $derived.by(() => {
		if (x_axis) {
			const column = response?.meta.find((column) => column.name === x_axis!);
			if (column) return resolve_type(column.type);
		}

		return 'unknown';
	});

	const y_type = $derived.by(() => {
		if (y_axis) {
			const column = response?.meta.find((column) => column.name === y_axis!);
			if (column) return resolve_type(column.type);
		}

		return 'unknown';
	});
</script>

{#if response}
	<div class="ChartContainer">
		<div class="Chart">
			{#if x_axis && y_axis}
				{#if isValidType(x_type) && isValidType(y_type)}
					{@const x = response.data.map((d) => applyType(d[x_axis!], x_type))}
					{@const y = response.data.map((d) => applyType(d[y_axis!], y_type))}
					<Line X={x} Y={y} {x_type} {y_type} x_label={x_axis} y_label={y_axis} />
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
