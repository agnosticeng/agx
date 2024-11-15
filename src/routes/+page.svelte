<script lang="ts">
	import SplitPane from '$lib/components/SplitPane.svelte';
	import VerticalPanel from '$lib/components/VerticalPanel.svelte';
	import { setDataSources } from '$lib/datasources/store';
	import type { DataSource } from '$lib/datasources/types';
	import { Editor, applySlugs } from '$lib/editor';
	import { exec, type CHResponse } from '$lib/query';
	import Table from '$lib/table.svelte';
	import type { PageData } from './$types';

	let response: CHResponse = $state.raw(undefined);

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
		const id = setTimeout(() => (loading = true), 250);
		response = await exec(applySlugs(query, datasources)).finally(() => {
			clearTimeout(id);
			loading = false;
		});
	}
</script>

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
						<Table {response} {loading} />
					{/snippet}
				</SplitPane>
			</section>
		{/snippet}
	</SplitPane>
</section>

<style>
	.screen {
		display: flex;
		height: 100vh;
	}
</style>
