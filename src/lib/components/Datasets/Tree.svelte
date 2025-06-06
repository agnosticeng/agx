<script lang="ts">
	import Folder from '$lib/icons/Folder.svelte';
	import FolderOpen from '$lib/icons/FolderOpen.svelte';
	import Table from '$lib/icons/Table.svelte';
	import { tick } from 'svelte';
	import Columns from './Columns.svelte';
	import { onCollapseAll, onExpand, onExpandAll } from './emitter';
	import Tree from './Tree.svelte';
	import { findNodeInTree, type TreeNode } from './utils';

	interface Props {
		node: TreeNode;
		level?: number;
	}

	let { node, level = 0 }: Props = $props();

	let expanded = $state(false);

	$effect(() => onCollapseAll(() => (expanded = false)));
	$effect(() => onExpandAll(() => (expanded = true)));

	function toggleExpanded() {
		expanded = !expanded;
	}

	$effect(() =>
		onExpand(async (value) => {
			if (node.type === 'dataset' && node.value === value) {
				expanded = true;
				await tick();
				animateExpand(value);
			} else if (node.type === 'group' && findNodeInTree(node.children, value)) expanded = true;
		})
	);

	function animateExpand(id: string) {
		const element = document.getElementById(id);
		if (element) {
			element.scrollIntoView({ behavior: 'smooth', block: 'start' });
			element.style.backgroundColor = 'hsl(60 40% 34% / 1)';
		}
	}
</script>

<div class="node" style:opacity={expanded ? 1 : 0.7 + level}>
	<button
		type="button"
		class:folder={node.type === 'group'}
		onclick={toggleExpanded}
		style="cursor: pointer"
		data-level={level}
	>
		{#if node.type == 'group'}
			<span class="folder name">
				{#if expanded}
					<FolderOpen size={10} />
				{:else}
					<Folder size={10} />
				{/if}
				<span>{node.name}</span>
			</span>
		{/if}

		{#if node.type == 'dataset'}
			<span
				class="name"
				id={node.value}
				ontransitionend={(e) => (e.currentTarget.style.backgroundColor = '')}
			>
				<Table size={10} />
				<span>{node.name}</span>
			</span>
		{/if}
	</button>
	{#if node.type === 'group'}
		<div style:display={expanded ? 'contents' : 'none'}>
			{#each node.children as child}
				<Tree node={child} level={level + 1} />
			{/each}
		</div>
	{/if}
	{#if node.type === 'dataset' && expanded}
		<div class="dataset">
			<Columns columns={node.columns} />
		</div>
	{/if}
</div>

<style>
	* {
		font-family: monospace;
		font-size: 12px;
		color: lightgray;
	}

	.node {
		margin-left: 4px;
	}

	button {
		background: transparent;
		border: none;
		padding: 0;
	}

	.name {
		display: flex;
		align-items: center;
		margin-top: 3px;

		transition: background-color linear 0.25s;
		scroll-margin-top: 30px;
	}

	.name span {
		margin-left: 3px;
	}
</style>
