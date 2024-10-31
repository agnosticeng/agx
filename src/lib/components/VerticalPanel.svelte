<script lang="ts">
	import SearchBar from '$lib/components/SearchBar.svelte';
	import type { DataSource } from '$lib/types';
	import { CircleStack, TableCells } from '@agnosticeng/heroicons-svelte/outline';

	type Props = {
		datasources?: DataSource[];
	};

	let { datasources = $bindable([]) }: Props = $props();

	const DATASOURCE_TYPE_COLOR_MAP: Record<DataSource['type'], string> = {
		CSV: 'hsl(58deg 37% 28%)',
		Parquet: 'hsl(20deg 37% 28%)',
		MergeTree: 'hsl(199deg 37% 28%)'
	};

	const DATASOURCE_TYPE_SHORT_NAME_MAP: Record<DataSource['type'], string> = {
		CSV: 'CSV',
		Parquet: 'PQT',
		MergeTree: 'MT'
	};

	function remove_nullable(type: unknown) {
		if (typeof type !== 'string') return 'Unknown';

		return type.replace(/Nullable\((.*)\)/, '$1');
	}
</script>

<section>
	<nav class="Tabs">
		<button aria-current="true">Source</button>
		<button>Queries</button>
		<button>History</button>
	</nav>
	<SearchBar />
	<article class="DataSources">
		{#each datasources as datasource, i}
			<details open={i === 0}>
				<summary>
					{#if datasource.type === 'MergeTree'}
						<CircleStack size="15" />
					{:else}
						<TableCells size="15" />
					{/if}
					<span>{datasource.name}</span>
					<span style:background-color={DATASOURCE_TYPE_COLOR_MAP[datasource.type]}>
						{DATASOURCE_TYPE_SHORT_NAME_MAP[datasource.type]}
					</span>
				</summary>
				<ul>
					{#each datasource.describe.data as column}
						<li>
							<span>{column.name}</span>
							<span>{remove_nullable(column.type)}</span>
						</li>
					{/each}
				</ul>
			</details>
		{/each}
	</article>
</section>

<style>
	section {
		width: var(--side-bar-width);
		padding: 14px 18px;
		background-color: hsla(0deg 0% 9%);

		display: flex;
		flex-direction: column;
		gap: 18px;

		overflow: auto;
	}

	.Tabs {
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

	details {
		width: 100%;

		details ~ & {
			margin-top: 12px;
		}

		& > summary {
			cursor: pointer;
			user-select: none;
			-webkit-user-select: none;
			display: flex;
			align-items: center;
			gap: 5px;

			&::-webkit-details-marker {
				display: none;
			}

			& > span:last-of-type {
				display: block;
				font-size: 8px;
				font-weight: 500;
				padding: 3px;
				border-radius: 3px;
				min-width: 16px;
			}
		}

		& > ul {
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
					flex-shrink: 0;
					font-size: 8px;
					font-weight: 500;
					padding: 2px;
					border-radius: 3px;
					background-color: hsl(0deg 0% 19%);
					min-width: 20px;
					text-align: center;
					font-family: 'Fira Mono', monospace;
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
