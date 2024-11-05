import { exec } from '$lib/query';
import type { DataSource } from '$lib/datasources/types';

export async function getDefaultDataSources() {
	const datasources: DataSource[] = [];

	const logs: DataSource = {
		name: 'Agnostic Logs',
		slug: 'agnostic_logs',
		path: "s3('https://data.agnostic.dev/ethereum-mainnet-pq/logs/*.parquet', 'Parquet')",
		type: 'Parquet',
		timestamp: Date.now()
	};

	const describe = await exec(`DESCRIBE TABLE ${logs.path}`);

	logs.describe = describe;

	datasources.push(logs);

	return datasources;
}

export * as Store from './store';
export type { DataSource } from './types';
