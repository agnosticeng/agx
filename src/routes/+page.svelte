<script lang="ts">
	import Table from '$lib/table.svelte';
	import Editor from '$lib/editor.svelte';
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

	$effect(() => {
		console.log($state.snapshot(datasources));
	});
</script>

<section class="screen">
	<VerticalPanel bind:datasources />
	<section class="right">
		<Editor bind:response />
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
	}
</style>
