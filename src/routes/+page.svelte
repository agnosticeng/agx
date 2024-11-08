<script lang="ts">
	import Table from '$lib/table.svelte';
	import { Editor, applySlugs } from '$lib/editor';
	import { exec, type CHResponse } from '$lib/query';
	import VerticalPanel from '$lib/components/VerticalPanel.svelte';
	import type { DataSource } from '$lib/datasources/types';
	import { appWindow } from '@tauri-apps/api/window';
	import { slugify } from '$lib/slugify';
	import type { PageData } from './$types';
	import { setDataSources } from '$lib/datasources/store';
	import SplitPane from '$lib/components/SplitPane.svelte';

	let response: CHResponse = $state.raw(undefined);

	let { data }: { data: PageData } = $props();

	let datasources = $state(data.datasources);

	appWindow.onFileDropEvent(async (event) => {
		if (event.payload.type !== 'drop') return;
		const path = event.payload.paths[0];
		const ext = get_extension(path);
		if (ext && ['csv', 'parquet'].includes(ext.toLowerCase())) {
			const describe = await exec(`DESCRIBE file('${path}', ${ext.toUpperCase()})`);

			if (!describe) return;

			const logs = {
				name: get_filename(path),
				slug: slugify(get_filename(path)),
				describe,
				path: `file('${path}', ${ext.toUpperCase()})`,
				type: ext.toUpperCase() as DataSource['type'],
				timestamp: Date.now()
			} satisfies DataSource;

			datasources.push(logs);

			setDataSources(datasources);
		}
	});

	function get_extension(path: string) {
		return path.split('.').pop();
	}

	function get_filename(path: string) {
		return path.split('/').pop()!.split('/').pop()!.split('.').slice(0, -1).join('');
	}

	async function handleCreate(source: DataSource) {
		const describe = await exec(`DESCRIBE ${source.path}`);
		if (!describe) return;

		datasources.push({ ...source, describe });
		await setDataSources(datasources);
	}

	let query = $state('');
	async function handleExec() {
		response = await exec(applySlugs(query, datasources));
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
						<Table {response} />
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
