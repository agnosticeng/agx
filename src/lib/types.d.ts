export type DataSource = {
	name: string;
	slug: string;
	describe: NonNullable<CHResponse>;
	type: 'Parquet' | 'CSV' | 'MergeTree';
	path: `file(${string})` | `s3(${string})`;
};
