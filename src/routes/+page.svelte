<script lang="ts">
	import Result from '$lib/components/Result.svelte';
	import SplitPane from '$lib/components/SplitPane.svelte';
	import VerticalPanel from '$lib/components/VerticalPanel.svelte';
	import { setDataSources } from '$lib/datasources/store';
	import type { DataSource } from '$lib/datasources/types';
	import { Editor, applySlugs } from '$lib/editor';
	import { exec, type CHResponse } from '$lib/query';
	import type { PageData } from './$types';

	let response: CHResponse = $state.raw(undefined);
	$inspect(response);

	let { data }: { data: PageData } = $props();

	let datasources = $state(data.datasources);

	async function handleCreate(source: DataSource) {
		const describe = await exec(`DESCRIBE ${source.path}`);
		if (!describe) return;

		const index = datasources.findIndex((s) => s.slug === source.slug);

		if (index !== -1) {
			datasources[index] = { ...source, describe };
		} else {
			datasources.push({ ...source, describe });
		}

		await setDataSources(datasources);
	}

	let query = $state('');
	let loading = $state(false);
	async function handleExec() {
		if (loading) return;

		const id = setTimeout(() => (loading = true), 250);
		response = await exec(applySlugs(query, datasources)).finally(() => {
			clearTimeout(id);
			loading = false;
		});
	}
</script>

<header data-tauri-drag-region>
	<div>
		<button onclick={handleExec} disabled={loading}>Run</button>
		<button>Save</button>
	</div>
</header>

<section class="screen">
	<SplitPane orientation="horizontal" position="242px" min="242px" max="40%">
		{#snippet a()}
			<VerticalPanel {datasources} onCreate={handleCreate} />
		{/snippet}
		{#snippet b()}
			<section class="right">
				<SplitPane orientation="vertical" min="20%" max="80%">
					{#snippet a()}
						<Editor bind:value={query} onExec={handleExec} sources={datasources} />
					{/snippet}
					{#snippet b()}
						<Result {response} {loading} />
					{/snippet}
				</SplitPane>
			</section>
		{/snippet}
	</SplitPane>
</section>

<style>
	header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: var(--window-title-bar-height);
		background-color: hsl(0deg 0% 18%);
		user-select: none;
		-webkit-user-select: none;

		display: flex;
		align-items: center;
		justify-content: end;
		padding: 0 8px;

		& > div {
			& > button {
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
		}
	}

	.screen {
		display: flex;
		padding-top: var(--window-title-bar-height);
		height: 100vh;
	}
</style>
