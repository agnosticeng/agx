import { invoke } from '@tauri-apps/api/tauri';
import type { CHResponse, ColumnDescriptor, Source } from './types';

export async function init() {
	await exec(`
		CREATE DATABASE IF NOT EXISTS agx;
		USE agx;
		CREATE TABLE IF NOT EXISTS ethereum_mainnet_logs ENGINE = S3('https://data.agnostic.dev/ethereum-mainnet-pq/logs/*.parquet');
		CREATE TABLE IF NOT EXISTS ethereum_mainnet_blocks ENGINE = S3('https://data.agnostic.dev/ethereum-mainnet-pq/blocks/*.parquet');
	`);
}

export async function exec(query: string) {
	try {
		const r: string = await invoke('query', { query });
		if (!r) return;

		return JSON.parse(r) as CHResponse;
	} catch (e) {
		console.error(e);
	}
}

export async function get_sources(): Promise<Source[]> {
	const response = await exec(`
select
    t.name as name,
    t.engine as engine,
    groupArray(map(
        'name', c.name,
        'type', c.type
    )) as columns
from system.tables as t
inner join system.columns as c on t.name = c.table
where database = 'agx'
group by t.name, t.engine
  `);

	if (response)
		return response.data as { name: string; engine: string; columns: ColumnDescriptor[] }[];

	return [];
}

export type { CHResponse, ColumnDescriptor, Source };
