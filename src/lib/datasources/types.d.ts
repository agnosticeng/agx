import type { CHResponse } from '../query';

export type DataSource = {
	name: string;
	slug: string;
	describe?: CHResponse;
	type: 'Parquet' | 'CSV' | 'MergeTree';
	path: `file(${string})` | `s3(${string})`;
	timestamp: number;
};
