<script lang="ts">
	import Table from '$lib/table.svelte';
	import Editor from '$lib/editor.svelte';
	import { exec, type CHResponse } from '$lib/query';
	import VerticalPanel from '$lib/components/VerticalPanel.svelte';
	import type { DataSource } from '$lib/types';
	import { onMount } from 'svelte';
	import { appWindow } from '@tauri-apps/api/window';
	import { slugify } from '$lib/slugify';

	let response: CHResponse = $state.raw(undefined);

	let datasources = $state<DataSource[]>([]);

	onMount(async () => {
		if (datasources.find((d) => d.name === 'Agnostic Logs' && d.type === 'Parquet')) return;

		const describe = await exec(
			`DESCRIBE TABLE s3('https://data.agnostic.dev/ethereum-mainnet-pq/logs/*.parquet', 'Parquet')`
		);

		if (!describe) return;

		const logs = {
			name: 'Agnostic Logs',
			slug: 'agnostic_logs',
			describe,
			path: "s3('https://data.agnostic.dev/ethereum-mainnet-pq/logs/*.parquet', 'Parquet')",
			type: 'Parquet'
		} satisfies DataSource;

		datasources.push(logs);
	});

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
				type: ext.toUpperCase() as DataSource['type']
			} satisfies DataSource;

			datasources.push(logs);
		}
	});

	function get_extension(path: string) {
		return path.split('.').pop();
	}

	function get_filename(path: string) {
		return path.split('/').pop()!.split('/').pop()!.split('.').slice(0, -1).join('');
	}
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
