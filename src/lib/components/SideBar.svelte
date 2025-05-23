<script lang="ts">
	import type { Table } from '$lib/olap-engine';
	import type { HistoryEntry } from '$lib/repositories/history';
	import type { Query } from '$lib/repositories/queries';
	import { tick } from 'svelte';
	import Datasets, { goToDefinition, onExpand as onDatasetExpand } from './Datasets';
	import History from './History.svelte';
	import ProxySwitch from './ProxySwitch.svelte';
	import Queries from './Queries/Queries.svelte';

	type Tab = 'sources' | 'queries' | 'history';

	let tab = $state<Tab>('sources');
	function switch_to(next: Tab) {
		tab = next;
	}

	$effect(() =>
		onDatasetExpand(async (table) => {
			if (tab !== 'sources') {
				tab = 'sources';
				await tick();
				goToDefinition(table);
			}
		})
	);

	type Props = {
		tables?: Table[];

		history?: HistoryEntry[];
		onHistoryOpen?: (entry: HistoryEntry) => MaybePromise<void>;
		onHistoryDelete?: (entry: HistoryEntry) => MaybePromise<void>;

		queries?: Query[];
		onQueryOpen?: (query: Query) => MaybePromise<void>;
		onQueryRename?: (query: Query) => MaybePromise<void>;
		onQueryDelete?: (query: Query) => MaybePromise<void>;
	};

	let {
		tables = [],
		history = [],
		onHistoryOpen,
		onHistoryDelete,
		queries = [],
		onQueryDelete,
		onQueryOpen,
		onQueryRename
	}: Props = $props();
</script>

<section>
	<nav>
		<button aria-current={tab === 'sources'} onclick={() => switch_to('sources')}>Sources</button>
		<button aria-current={tab === 'queries'} onclick={() => switch_to('queries')}>Queries</button>
		<button aria-current={tab === 'history'} onclick={() => switch_to('history')}>History</button>
	</nav>
	<div>
		{#if tab === 'sources'}
			<Datasets {tables} />
		{/if}
		{#if tab === 'queries'}
			<Queries {queries} onDelete={onQueryDelete} onOpen={onQueryOpen} onRename={onQueryRename} />
		{/if}
		{#if tab === 'history'}
			<History {history} onOpen={onHistoryOpen} onDelete={onHistoryDelete} />
		{/if}
	</div>
	{#if PLATFORM === 'NATIVE'}
		<ProxySwitch />
	{/if}
</section>

<style>
	section {
		height: 100%;
		width: 100%;

		padding: 14px 20px 0;
		background-color: hsl(0deg 0% 5%);
		border-right: 1px solid hsl(0deg 0% 20%);

		display: grid;
		grid-template-rows: minmax(0, auto) 1fr minmax(0, auto);
	}

	nav {
		display: flex;
		justify-content: space-between;
		margin-bottom: 18px;

		& > button {
			font-size: 11px;
			font-weight: 500;
			background-color: transparent;
			padding: 4px 10px;
			border-radius: 3px;
			cursor: pointer;

			&:is(:hover, :focus-within, [aria-current='true']) {
				background-color: hsl(0deg 0% 19%);
			}
		}
	}

	div {
		display: flex;
		flex-direction: column;
		overflow: hidden;
		gap: 18px;
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
