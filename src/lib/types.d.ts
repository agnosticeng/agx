import type { Datasets } from '$lib/components/Datasets/sources.svelte';
import type { HistorySource } from '$lib/components/History/history_source.svelte';

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
	history: HistorySource;
};
