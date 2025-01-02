export type CHResponse = {
	meta: Array<ColumnDescriptor>;
	data: Array<{ [key: string]: any }>;
	rows: number;
	statistics: {
		/** time elapsed in second */
		elapsed: number;
		rows_read: number;
		bytes_read: number;
	};
};

export interface ColumnDescriptor {
	name: string;
	type: string;
}

export interface Source {
	name: string;
	engine: string;
	columns: ColumnDescriptor[];
}
