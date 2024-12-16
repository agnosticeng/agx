import { exec, type CHResponse } from '$lib/query';
import type { ColumnDescriptor, Dataset } from '$lib/types';

export function filter(sources: Dataset[], search: string) {
	if (!search) return sources;
	const search_ = search.toLowerCase();

	return sources.filter(
		(s) =>
			s.name.toLowerCase().includes(search_) ||
			s.slug.includes(search_) ||
			s.columns?.some((c) => c.name.toLowerCase().includes(search_))
	);
}

export const DATASOURCE_TYPE_COLOR_MAP: Record<Dataset['type'], string> = {
	CSV: 'hsl(58deg 37% 28%)',
	Parquet: 'hsl(20deg 37% 28%)',
	MergeTree: 'hsl(199deg 37% 28%)'
};

export const DATASOURCE_TYPE_SHORT_NAME_MAP: Record<Dataset['type'], string> = {
	CSV: 'CSV',
	Parquet: 'PQT',
	MergeTree: 'MT'
};

export function remove_nullable(type: string) {
	return type.replace(/Nullable\((.*)\)/, '$1');
}

export function describe_to_column_descriptors(response: CHResponse): ColumnDescriptor[] {
	return response.data.map((d) => {
		return {
			name: d.name as string,
			type: d.type as string
		};
	});
}

export async function getDefaultSource() {
	const defaults: Dataset = {
		name: 'Agnostic Logs',
		slug: 'agnostic_logs',
		path: "s3('https://data.agnostic.dev/ethereum-mainnet-pq/logs/*.parquet', 'Parquet')",
		type: 'Parquet',
		last_refresh: Date.now()
	};

	const response = await exec(`DESCRIBE TABLE ${defaults.path}`);
	if (!response) return;

	defaults.columns = describe_to_column_descriptors(response);

	return defaults;
}

export const DEFAULT_SOURCE = {
	name: 'Agnostic Logs',
	slug: 'agnostic_logs',
	path_url: 's3://data.agnostic.dev/ethereum-mainnet-pq/logs/*.parquet'
};
