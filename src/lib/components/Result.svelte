<script lang="ts">
	import { Table } from '@agnosticeng/dv';
	import Trash from '$lib/icons/Trash.svelte';
	import type { OLAPResponse } from '$lib/olap-engine';
	import Console, { type Log } from './Console.svelte';
	import Settings from '$lib/icons/Settings.svelte';
	import Chart from './Chart/Container.svelte';

	interface Props {
		response?: OLAPResponse;
		logs?: Log[];
		tab?: 'data' | 'chart' | 'logs';
		onClearLogs?: () => void;
	}

	let { response, logs = [], tab = $bindable('data'), onClearLogs }: Props = $props();
</script>

<section>
	<nav>
		<button class="tab" aria-current={tab === 'data'} onclick={() => (tab = 'data')}>Data</button>
		<button class="tab" aria-current={tab === 'chart'} onclick={() => (tab = 'chart')}>Chart</button
		>
		<button class="tab" aria-current={tab === 'logs'} onclick={() => (tab = 'logs')}>Logs</button>
		{#if tab === 'logs'}
			<div class="spacer"></div>
			<button class="action" onclick={() => onClearLogs?.()}><Trash size="12" /></button>
		{/if}
		{#if tab === 'chart'}
			<div class="spacer"></div>
			<button class="action" data-action="toggle-chart-settings"><Settings size="12" /></button>
		{/if}
	</nav>
	<div>
		<div class="tab-content" style:visibility={tab === 'data' ? 'visible' : 'hidden'}>
			{#if response}
				<Table data={response.data} columns={response.meta} />
			{/if}
		</div>

		<div class="tab-content" style:visibility={tab === 'chart' ? 'visible' : 'hidden'}>
			<Chart data={response?.data ?? []} columns={response?.meta ?? []} />
		</div>

		<div class="tab-content" style:visibility={tab === 'logs' ? 'visible' : 'hidden'}>
			<Console {logs} />
		</div>
	</div>
</section>

<style>
	.tab-content {
		position: absolute;
		height: 100%;
		width: 100%;
		overflow: auto;
	}

	section {
		background: hsl(0deg 0% 5%);
		color: hsl(0deg 0% 96%);
		display: flex;
		flex-direction: column;

		& > div {
			position: relative;
			height: 100%;
			overflow: hidden;
		}

		& > nav {
			flex-shrink: 0;
			user-select: none;
			-webkit-user-select: none;
			height: 28px;

			display: flex;
			align-items: center;

			position: relative;

			&::before {
				content: '';
				position: absolute;
				width: 100%;
				height: 1px;
				bottom: 0px;
				left: 0;
				background-color: hsl(0deg 0% 20%);
				z-index: 1;
			}

			& > button.tab {
				border-right: 1px solid hsl(0deg 0% 20%);
			}

			& > button {
				height: 100%;
				font-size: 11px;
				font-weight: 500;
				background-color: transparent;
				padding: 0 16px;
				border-top: 1px solid hsl(0deg 0% 20%);

				&:is(:hover, :focus-within) {
					cursor: pointer;
				}

				&:is([aria-current='true']) {
					background-color: hsl(0deg 0% 5%);
					z-index: 1;
				}
			}

			& .spacer {
				flex: 1;
			}

			& .action {
				height: 100%;
				aspect-ratio: 1;
				padding: 0px;

				display: flex;
				align-items: center;
				justify-content: center;

				&:is(:hover):not(:disabled) {
					background-color: hsl(0deg 0% 10%);
					cursor: pointer;

					&:active {
						background-color: hsl(0deg 0% 13%);
					}
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
