<script lang="ts">
	import type { Table } from '$lib/olap-engine';

	import SearchBar from '$lib/components/SearchBar.svelte';
	import CollapseAll from '$lib/icons/CollapseAll.svelte';
	import { collapseAll, expandAll } from './emitter';
	import Tree from './Tree.svelte';
	import { buildTree, filter } from './utils';

	type Props = {
		tables?: Table[];
	};

	let { tables = [] }: Props = $props();

	let search = $state<string>('');
	const filtered = $derived(filter(tables, search));
	const tree = $derived(buildTree(filtered));

	$effect(() => {
		if (search) expandAll();
		else collapseAll();
	});
</script>

<SearchBar bind:value={search} />

<div class="datasets">
	<div class="toolbar">
		<button onclick={() => collapseAll()}><CollapseAll size="12" /></button>
	</div>
	{#each tree as node}
		<Tree {node} />
	{/each}
</div>

<style>
	.datasets {
		position: relative;
		flex: 1;
		overflow-y: scroll;
	}

	.toolbar {
		position: sticky;
		top: 0px;
		height: 16px;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: end;
		background-color: hsl(0deg 0% 5%);
	}

	.toolbar button {
		height: 100%;
		aspect-ratio: 1;
		background-color: transparent;
		border-radius: 0;
		display: flex;
		justify-content: center;
		align-items: center;
		border-radius: 4px;
		color: hsl(0deg 0% 83%);

		&:hover:not(:disabled) {
			background-color: hsl(0deg 0% 10%);
		}
	}

	button {
		appearance: none;
		outline: none;
		border: none;
		font-size: 10px;
		font-weight: 500;
		padding: 0;

		&:is(:hover, :focus-within):not(:disabled) {
			cursor: pointer;
		}
	}
</style>
