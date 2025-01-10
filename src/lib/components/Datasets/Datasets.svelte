<script lang="ts">
	import type { Table } from '$lib/olap-engine';

	import SearchBar from '$lib/components/SearchBar.svelte';
	import Database from '$lib/icons/Database.svelte';
	import TableC from '$lib/icons/Table.svelte';
	import {
		filter,
		remove_nullable,
		SOURCE_TYPE_COLOR_MAP,
		SOURCE_TYPE_SHORT_NAME_MAP
	} from './utils';

	type Props = {
		tables?: Table[];
	};

	let { tables = [] }: Props = $props();

	let loading = $state(false);

	let search = $state<string>('');
	const filtered = $derived(filter(tables, search));
</script>

<SearchBar bind:value={search} />
<article>
	{#each filtered as source, i (source.name)}
		<details open={i === 0}>
			<summary>
				{#if source.engine === 'MergeTree'}
					<Database size="15" />
				{:else}
					<TableC size="15" />
				{/if}
				<h3>{source.name}</h3>
				<span class="Tag" style:background-color={SOURCE_TYPE_COLOR_MAP[source.engine]}>
					{SOURCE_TYPE_SHORT_NAME_MAP[source.engine]}
				</span>
			</summary>
			<ul>
				{#each source.columns ?? [] as column}
					<li>
						<span>{column.name}</span>
						<span>{remove_nullable(column.type)}</span>
					</li>
				{/each}
			</ul>
		</details>
	{/each}
</article>

<style>
	article {
		flex: 1;
		overflow-y: auto;
	}

	details {
		width: 100%;

		details ~ & {
			margin-top: 12px;
		}
	}

	summary {
		cursor: pointer;
		user-select: none;
		-webkit-user-select: none;
		display: flex;
		align-items: center;
		gap: 5px;

		padding: 3px 5px;
		border-radius: 3px;

		&::-webkit-details-marker {
			display: none;
		}

		& > :global(svg),
		& > span {
			flex-shrink: 0;
		}

		& > h3 {
			flex-shrink: 1;

			text-overflow: ellipsis;
			white-space: nowrap;
			overflow: hidden;
		}
	}

	h3 {
		font-weight: 500;
		margin: 0;
	}

	.Tag {
		display: block;
		font-size: 8px;
		font-weight: 500;
		padding: 3px;
		border-radius: 3px;
		min-width: 16px;
	}

	ul {
		/* Reset */
		list-style: none;
		margin: 0;
		padding: 0;

		/* Stack */
		display: flex;
		flex-direction: column;
		gap: 5px;

		/* Custom style */
		padding: 12px 0;
		padding-left: 5px;

		& > li {
			display: flex;
			align-items: center;

			& > span:first-of-type {
				flex-grow: 1;
			}

			& > span:last-of-type {
				font-size: 8px;
				font-weight: 500;
				padding: 2px;
				border-radius: 3px;
				background-color: hsl(0deg 0% 19%);
				text-align: center;
				font-family: 'Fira Mono', monospace;

				flex-shrink: 1;

				text-overflow: ellipsis;
				white-space: nowrap;
				overflow: hidden;
			}
		}

		&:last-of-type {
			padding-bottom: 0;
		}
	}
</style>
