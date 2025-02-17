import { CHDBEngine } from './engine-chdb';
import { RemoteEngine } from './engine-remote';
import type { IEventEmitter } from './EventEmitter';

export type OLAPResponse = {
	meta: Array<ColumnDescriptor>;
	data: Array<{ [key: string]: any }>;
	rows: number;
	statistics: {
		bytes_read: number;
		elapsed: number;
		rows_read: number;
	};
};

export interface ColumnDescriptor {
	name: string;
	type: string;
}

export interface Table {
	name: string;
	engine: string;
	columns: ColumnDescriptor[];
}

export type Events = 'error' | 'success';

export interface OLAPEngine extends IEventEmitter<Events> {
	init(): Promise<void>;
	exec(query: string): Promise<OLAPResponse | undefined>;
	getSchema(): Promise<Table[]>;
	getUDFs(): Promise<string[]>;
}

export const engine: OLAPEngine = PLATFORM === 'WEB' ? new RemoteEngine() : new CHDBEngine();
