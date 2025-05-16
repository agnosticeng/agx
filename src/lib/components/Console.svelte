<script lang="ts" module>
	export interface Log {
		level: 'error';
		timestamp: Date;
		data: string;
		query: string;
	}
</script>

<script lang="ts">
	import Sparkles from '$lib/icons/Sparkles.svelte';

	interface Props {
		logs: Log[];
		onClickFixWithAi?: (log: Log) => void;
	}

	let { logs, onClickFixWithAi }: Props = $props();
</script>

<div class="container">
	{#each logs as log}
		<div class="line">
			<span class="timestamp">{log.timestamp.toUTCString()}</span>
			<span class={log.level}>{log.data}</span>
			{#if onClickFixWithAi}
				<button title="Fix with the AI Assistant" onclick={() => onClickFixWithAi(log)}>
					<Sparkles size="12" />
				</button>
			{/if}
		</div>
	{/each}
</div>

<style>
	.container {
		height: 100%;
		width: 100%;
		padding: 4px 7px;
		position: relative;

		overflow-y: auto;

		& > .line {
			display: block;
			font-family: monospace;
			font-size: 11px;

			& .timestamp {
				display: block;

				&::before {
					content: '-- ';
				}
			}

			& .error {
				color: hsl(0deg 100% 90%);
			}

			&:not(:last-of-type) {
				margin-bottom: 12px;
			}

			& > button {
				height: 18px;
				aspect-ratio: 1;
				border-radius: 4px;
				padding-top: 2px;

				&:hover {
					background-color: hsl(0deg 0% 10%);
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

		&:not(:disabled):hover {
			cursor: pointer;
		}
	}
</style>
