import { exec, type CHResponse } from '$lib/query';
import type { ColumnDescriptor, Dataset } from '$lib/types';
import type { FormValues as AddDatasetFormValues } from './AddDataset.svelte';

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

export function describe_to_column_descriptors(
	response: NonNullable<CHResponse>
): ColumnDescriptor[] {
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

export async function form_values_to_dataset(values: AddDatasetFormValues): Promise<Dataset> {
	const ext = get_extension(values.path);
	const type = ext?.toLowerCase() === 'parquet' ? 'Parquet' : 'CSV';

	const dataset_path = `${values.connection_type}('${values.path}', '${type}')`;

	const set: Dataset = {
		name: values.name,
		slug: values.slug,
		path: dataset_path,
		type: type,
		last_refresh: Date.now()
	};

	const response = await exec(`DESCRIBE TABLE ${dataset_path};`);
	if (!response) throw Error('Unexpected response: empty response');

	set.columns = describe_to_column_descriptors(response);

	return set;
}

function get_extension(path: string) {
	return path.split('.').pop();
}
