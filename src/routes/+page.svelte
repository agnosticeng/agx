<script lang="ts">
	import type { Table } from '$lib/olap-engine';
	import { engine, type OLAPResponse } from '$lib/olap-engine';

	import { Editor } from '$lib/components/Editor';
	import Result from '$lib/components/Result.svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import { SplitPane } from '$lib/components/SplitPane';
	import WindowTitleBar from '$lib/components/WindowTitleBar.svelte';
	import type { PageData } from './$types';

	let response = $state.raw<OLAPResponse>();

	let { data }: { data: PageData } = $props();

	let query = $state('');
	let loading = $state(false);

	async function handleExec() {
		if (loading) return;
		loading = true;
		response = await engine.exec(query).finally(() => (loading = false));
	}

	let tables = $state<Table[]>([]);

	$effect(() => {
		engine.getSchema().then((t) => {
			tables = t;
		});
	});
</script>

<WindowTitleBar>
	{#snippet actions()}
		<button onclick={handleExec} disabled={loading}>Run</button>
	{/snippet}
</WindowTitleBar>

<section class="screen">
	<SplitPane orientation="horizontal" position="242px" min="242px" max="40%">
		{#snippet a()}
			<SideBar {tables} />
		{/snippet}
		{#snippet b()}
			<SplitPane orientation="vertical" min="20%" max="80%" --color="hsl(0deg 0% 12%)">
				{#snippet a()}
					<Editor bind:value={query} onExec={handleExec} {tables} />
				{/snippet}
				{#snippet b()}
					<Result {response} />
				{/snippet}
			</SplitPane>
		{/snippet}
	</SplitPane>
</section>

<style>
	button {
		appearance: none;
		outline: none;
		border: none;
		font-size: 10px;
		font-weight: 500;
		background-color: hsl(0deg 0% 9%);
		padding: 4px 10px;
		border-radius: 3px;

		cursor: pointer;

		&:is(:hover, :focus-within) {
			background-color: hsl(0deg 0% 15%);
		}
	}

	.screen {
		padding-top: var(--window-title-bar-height);
		height: 100vh;
		width: 100vw;
	}
</style>
