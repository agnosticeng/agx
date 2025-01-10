<script lang="ts">
	import type { HistoryEntry } from '$lib/repositories/history';
	import dayjs from 'dayjs';
	import relativeTime from 'dayjs/plugin/relativeTime';

	dayjs.extend(relativeTime);

	interface Props {
		history: HistoryEntry[];
		onHistoryClick?: (entry: HistoryEntry) => void;
	}

	let { history: entries, onHistoryClick }: Props = $props();
</script>

<ol role="menu">
	{#each entries as entry}
		<li
			tabindex="-1"
			oncontextmenu={(e) => {
				e.preventDefault();
			}}
			role="menuitem"
			onkeydown={(e) => {
				if (e.key === 'Enter') {
					onHistoryClick?.(entry);
					e.currentTarget.blur();
				}
			}}
			onclick={(e) => {
				if (e.detail >= 2) {
					onHistoryClick?.(entry);
					e.currentTarget.blur();
				}
			}}
		>
			<div class="content">{entry.content}</div>
			<span class="time">{dayjs(entry.timestamp).fromNow()}</span>
		</li>
	{/each}
</ol>

<style>
	ol {
		list-style: none;
		margin: 0;
		padding: 0;

		flex: 1;
		overflow-y: auto;
	}

	.time {
		font-size: 10px;
		color: hsl(0deg 0% 70%);
	}

	li {
		padding: 3px 5px;
		border-radius: 3px;

		cursor: default;
		user-select: none;
		-webkit-user-select: none;
		font-weight: 500;

		&:is(:focus-within) {
			outline: none;
			background-color: hsl(0deg 0% 19% / 100%);
		}
	}

	.content {
		height: 18px;
		font-weight: 500;
		padding: 3px 0;
		line-height: 1.15;

		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
</style>
