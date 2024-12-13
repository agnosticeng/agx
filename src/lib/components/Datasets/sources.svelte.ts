import { exec } from '$lib/query';
import type { Dataset, MaybePromise } from '$lib/types';
import { describe_to_column_descriptors } from './utils';

export interface RawSource {
	/** Name of the Dataset */
	name: string;
	/** slug that will be used to identify the dataset in the queries */
	slug: string;
	/** URL like, example: s3://data.agnostic.dev/ethereum-mainnet-pq/logs/*.parquet or file:///Users/johndoe/data/logs.csv */
	path_url: string;
}

export interface DatasetsConfig {
	onupdate?: (dataset: Dataset) => MaybePromise<void>;
	onreset?: (datasets: Dataset[]) => MaybePromise<void>;
}

export class Datasets {
	#sources = $state.raw<Dataset[]>([]);

	#onupdate: NonNullable<DatasetsConfig['onupdate']>;
	#onreset: NonNullable<DatasetsConfig['onreset']>;

	constructor(sources: Dataset[], { onreset, onupdate }: DatasetsConfig = {}) {
		this.#sources = sources;

		this.#onupdate = onupdate ?? (() => {});
		this.#onreset = onreset ?? (() => {});
	}

	get sources() {
		return this.#sources;
	}

	add(source: RawSource) {
		if (!validate_url(source.path_url)) throw new TypeError('Invalid path format');

		const { path, type } = parse_path_url(source.path_url);

		const new_source = {
			name: source.name,
			slug: source.slug,
			path: path,
			last_refresh: -1,
			type: type
		};
		this.#sources = this.#sources.concat(new_source);

		this.refresh(new_source);
	}

	update(source: Dataset) {
		this.#sources = this.#sources.map((old) => {
			if (old.slug === source.slug) {
				return source;
			}

			return old;
		});

		this.#onupdate(source);
	}

	remove(source: Dataset) {
		const index = this.#sources.findIndex((s) => s.slug === source.slug);
		if (index === -1)
			throw new Error('Tried to remove a source that is not registered in the datasets');

		this.#sources = this.#sources.filter((s) => s.slug !== source.slug);

		this.#onreset(this.#sources);
	}

	async refresh(source: Dataset) {
		const index = this.#sources.findIndex((s) => s.slug === source.slug);
		if (index === -1)
			throw new Error('Tried to refresh a source that is not registered in the datasets');

		const response = await exec(`DESCRIBE ${source.path}`);
		if (!response) throw new Error(`Cannot update '${source.name}' source`);
		const columns = describe_to_column_descriptors(response);

		this.update({ ...source, columns, last_refresh: Date.now() });
	}
}

const S3_REGEXP =
	/s3:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=*]+)/;

const FILE_REGEXP = /file:\/\/([-a-zA-Z0-9()@:%_\+.~#?&// ;=*]+)/;

function validate_url(_path: string) {
	return S3_REGEXP.test(_path) || FILE_REGEXP.test(_path);
}

function parse_path_url(path: string) {
	const protocol_func = new URL(path).protocol.replace(':', '').toLowerCase();
	const url = path.replace(/s3/, 'https').replace(/file:\/\//, '');
	const extension = url.split('.').pop();
	if (!extension) throw new TypeError('Invalid path format: extension not specified');
	const file_type = extract_file_type(extension);
	if (!file_type)
		throw new TypeError(`Invalid path format: unsupported extension ${file_type ?? ''}`.trim());

	return { path: `${protocol_func}('${url}', '${file_type}')`, type: file_type };
}

function extract_file_type(extension: string): 'CSV' | 'Parquet' | undefined {
	switch (extension.toLowerCase()) {
		case 'csv':
			return 'CSV';
		case 'parquet':
			return 'Parquet';
	}
}
