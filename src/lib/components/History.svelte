<script lang="ts">
	import { getAppContext } from '$lib/context';
	import type { HistoryEntry } from '$lib/repositories/history';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';
	import SearchBar from './SearchBar.svelte';

	dayjs.extend(relativeTime);

	interface Props {
		history: HistoryEntry[];
		onOpen?: (entry: HistoryEntry) => MaybePromise<void>;
		onDelete?: (entry: HistoryEntry) => MaybePromise<void>;
	}

	let { history: entries, onOpen, onDelete }: Props = $props();

	let search = $state('');

	let filtered = $derived(
		search ? entries.filter((e) => e.content.toLowerCase().includes(search.toLowerCase())) : entries
	);

	const { contextmenu } = getAppContext();
</script>

<SearchBar bind:value={search} />
<ol role="menu">
	{#each filtered as entry}
		<li
			tabindex="-1"
			oncontextmenu={(e) => {
				e.preventDefault();
				contextmenu.show({
					items: [
						{ label: 'Open', onClick: () => onOpen?.(entry), disabled: !onOpen },
						{ is_separator: true },
						{ label: 'Delete', onClick: () => onDelete?.(entry), disabled: !onDelete }
					],
					position: { x: e.clientX, y: e.clientY }
				});
			}}
			role="menuitem"
			onkeydown={async (e) => {
				if (e.key === 'Enter') {
					await onOpen?.(entry);
					e.currentTarget.blur();
				}
				if (e.key === 'Backspace') {
					await onDelete?.(entry);
					e.currentTarget.blur();
				}
			}}
			onclick={async (e) => {
				if (e.detail >= 2) {
					await onOpen?.(entry);
					e.currentTarget.blur();
				}
			}}
			ontouchend={async (e) => {
				await onOpen?.(entry);
				e.currentTarget.blur();
			}}
		>
			<div class="content">{entry.content}</div>
			<span class="time">{dayjs(entry.timestamp).fromNow()}</span>
		</li>
	{/each}
</ol>

<style>
	ol {
		color: hsl(0deg 0% 90%);

		list-style: none;
		margin: 0;
		padding: 0;

		flex: 1;
		overflow-y: auto;
	}

	.time {
		font-size: 11px;
		color: hsl(0deg 0% 70%);
	}

	li {
		padding: 3px 5px;
		border-radius: 3px;

		cursor: default;
		user-select: none;
		-webkit-user-select: none;

		&:is(:focus-within) {
			outline: none;
			background-color: hsl(0deg 0% 19% / 100%);
		}
	}

	.content {
		height: 18px;
		font-weight: 500;
		font-size: 13px;
		padding: 3px 0;
		line-height: 1.15;

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
