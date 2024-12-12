import type { History } from '$lib/history.svelte';
import type { Datasets } from '$lib/sources.svelte';

export interface ColumnDescriptor {
	name: string;
	type: string;
}

export interface Dataset {
	name: string;
	/** Must be unique */
	slug: string;
	path: string;
	type: 'CSV' | 'Parquet' | 'MergeTree';
	/** Describe result */
	columns?: ColumnDescriptor[];
	/** Timestamp */
	last_refresh: number;
}

type MaybePromise<T> = T | Promise<T>;

export type AppContext = {
	datasets: Datasets;
	history: History<string>;
};
