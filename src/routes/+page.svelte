<script lang="ts">
	import { DEFAULT_SOURCE } from '$lib/components/Datasets/utils';
	import { datasets_to_schema, Editor, Workspace } from '$lib/components/Editor';
	import Result from '$lib/components/Result.svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import { SplitPane } from '$lib/components/SplitPane';
	import WindowTitleBar from '$lib/components/WindowTitleBar.svelte';
	import { set_app_context } from '$lib/context';
	import { exec, type CHResponse } from '$lib/query';
	import { Datasets } from '$lib/sources.svelte';
	import { set_sources_in_store } from '$lib/store';
	import { applySlugs } from '$lib/utils/datasets';
	import type { PageData } from './$types';

	let response = $state.raw<CHResponse>();

	let { data }: { data: PageData } = $props();

	let loading = $state(false);

	const datasets = new Datasets(data.sources, {
		onreset(datasets) {
			set_sources_in_store(datasets);
		},
		onupdate(_dataset) {
			set_sources_in_store(datasets.sources);
		}
	});

	const workspace = new Workspace([{ name: 'agx_temp_file.sql', contents: '' }]);

	set_app_context({ datasets, workspace });

	$effect.pre(() => {
		if (!datasets.sources.length) {
			datasets.add(DEFAULT_SOURCE);
		}
	});

	async function handleExec() {
		if (loading) return;
		loading = true;
		response = await exec(applySlugs(workspace.current.contents, datasets.sources)).finally(
			() => (loading = false)
		);
	}

	function handleKeyDown(e: KeyboardEvent) {
		if (e.metaKey && e.key === 'Enter') {
			e.preventDefault();
			handleExec();
		}
	}
</script>

<svelte:window onkeydown={handleKeyDown} />

<WindowTitleBar>
	{#snippet actions()}
		<button onclick={handleExec} disabled={loading}>Run</button>
	{/snippet}
</WindowTitleBar>

<section class="screen">
	<SplitPane orientation="horizontal" position="242px" min="242px" max="40%">
		{#snippet a()}
			<SideBar />
		{/snippet}
		{#snippet b()}
			<SplitPane orientation="vertical" min="20%" max="80%" --color="hsl(0deg 0% 12%)">
				{#snippet a()}
					<Editor {workspace} schema={datasets_to_schema(datasets.sources)} />
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
