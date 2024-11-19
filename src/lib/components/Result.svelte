<script lang="ts">
	import type { CHResponse } from '$lib/query';
	import Table from '$lib/components/Table.svelte';
	import Chart from './Chart.svelte';

	let { response, loading }: { response: CHResponse; loading: boolean } = $props();
	$inspect(loading);

	let tab = $state<'data' | 'chart'>('data');
</script>

<section>
	<div>
		{#if tab === 'data'}
			<Table {response} />
		{:else if tab === 'chart'}
			<Chart {response} />
		{/if}
	</div>
	<nav>
		<button aria-current={tab === 'data'} onclick={() => (tab = 'data')}> Data </button>
		<button aria-current={tab === 'chart'} onclick={() => (tab = 'chart')}> Chart </button>
	</nav>
</section>

<style>
	section {
		background: hsl(0deg 0% 16%);
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
