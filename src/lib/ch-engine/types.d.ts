export type CHResponse = {
	meta: Array<ColumnDescriptor>;
	data: Array<{ [key: string]: any }>;
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
