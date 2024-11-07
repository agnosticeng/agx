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
	<VerticalPanel {datasources} onCreate={handleCreate} />
	<section class="right">
		<div>
			<Editor bind:value={query} onExec={handleExec} sources={datasources} />
		</div>
		<Table {response} />
	</section>
</section>

<style>
	.screen {
		display: flex;
		height: 100vh;
	}

	.right {
		flex-grow: 1;

		& > div {
			width: 100%;
			height: 50vh;
			padding: 2px;
			overflow: hidden;
		}
	}
</style>
