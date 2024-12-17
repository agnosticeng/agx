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

export type AppContext = {};
