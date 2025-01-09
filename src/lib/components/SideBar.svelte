<script lang="ts">
	import type { Table } from '$lib/olap-engine';
	import type { HistoryEntry } from '$lib/repositories/history';
	import type { Query } from '$lib/repositories/queries';
	import Datasets from './Datasets/Datasets.svelte';
	import History from './History.svelte';
	import Queries from './Queries/Queries.svelte';

	type Tab = 'sources' | 'queries' | 'history';

	let tab = $state<Tab>('sources');
	function switch_to(next_tab: Tab) {
		tab = next_tab;
	}

	type Props = {
		tables?: Table[];

		history?: HistoryEntry[];
		onHistoryClick?: (entry: HistoryEntry) => void;

		queries?: Query[];
		onQueryOpen?: (query: Query) => MaybePromise<void>;
		onQueryRename?: (query: Query) => MaybePromise<void>;
		onQueryDelete?: (query: Query) => MaybePromise<void>;
	};

	let {
		tables = [],
		history = [],
		onHistoryClick,
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
	{#if tab === 'sources'}
		<Datasets {tables} />
	{/if}
	{#if tab === 'queries'}
		<Queries {queries} ondelete={onQueryDelete} onopen={onQueryOpen} onrename={onQueryRename} />
	{/if}
	{#if tab === 'history'}
		<History {history} {onHistoryClick} />
	{/if}
</section>

<style>
	section {
		height: 100%;
		width: 100%;

		padding: 14px 18px;
		background-color: hsl(0deg 0% 9%);
		display: flex;
		flex-direction: column;
		gap: 18px;
	}

	nav {
		display: flex;
		justify-content: center;
		gap: 12px;

		& > button {
			font-size: 10px;
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

	button {
		appearance: none;
		outline: none;
		border: none;
		background: none;
		padding: 0;
		display: block;
	}
</style>
