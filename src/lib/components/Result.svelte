<script lang="ts">
	import { Table } from '$lib/components/Table';
	import type { CHResponse } from '$lib/query';
	import { untrack } from 'svelte';
	import ChartContainer from './ChartContainer.svelte';

	interface Props {
		response?: CHResponse;
	}

	let { response }: Props = $props();

	let tab = $state<'table' | 'chart'>('table');
	let y_axis = $state<string>('');
	let x_axis = $state<string>('');
	let chart_type = $state('line');

	$effect(() => {
		const names = response?.meta.map((m) => m.name);

		if (!names?.includes(untrack(() => y_axis))) y_axis = '';
		if (!names?.includes(untrack(() => x_axis))) x_axis = '';
	});
</script>

<section>
	<div>
		{#if response}
			{#if tab === 'table'}
				<Table {response} />
			{:else if tab === 'chart'}
				<ChartContainer {response} bind:x_axis bind:y_axis bind:type={chart_type} />
			{/if}
		{/if}
	</div>
	<nav>
		<button aria-current={tab === 'table'} onclick={() => (tab = 'table')}> Data </button>
		<button aria-current={tab === 'chart'} onclick={() => (tab = 'chart')}> Chart </button>
	</nav>
</section>

<style>
	section {
		background: hsl(0deg 0% 0%);
		color: hsl(0deg 0% 96%);
		display: flex;
		flex-direction: column;

		& > div {
			flex: 1;
			overflow: auto;
		}

		& > nav {
			padding: 7px 5px;
			border-top: 1px solid hsl(0deg 0% 29%);
			user-select: none;
			-webkit-user-select: none;

			display: flex;
			align-items: center;
			gap: 2px;

			& > button {
				font-size: 10px;
				font-weight: 500;
				background-color: transparent;
				padding: 4px 10px;
				border-radius: 3px;

				cursor: pointer;

				&:is(:hover, :focus-within, [aria-current='true']) {
					background-color: hsl(0deg 0% 29%);
				}
			}
		}
	}

	button {
		appearance: none;
		outline: none;
		border: none;
		background: none;
		padding: 0;
		display: block;
	}
</style>
