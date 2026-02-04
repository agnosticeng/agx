import { LocalEngine } from './engine-local';
import { RemoteEngine } from './engine-remote';
import type { IListener } from './EventListener';

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
	short: string;
	url: string;
	columns: ColumnDescriptor[];
}

export type Events = 'error' | 'success';

export type ExecOptions = { signal?: AbortSignal | null };

export interface OLAPEngine extends IListener<Events> {
	readonly isAbortable: boolean;
	init(): Promise<void>;
	exec(query: string, options?: ExecOptions): Promise<OLAPResponse | undefined>;
	getSchema(): Promise<Table[]>;
	getUDFs(): Promise<string[]>;
}

export const engine: OLAPEngine =
	PLATFORM === 'WEB' || (typeof window !== 'undefined' && window.location.search.includes('proxy='))
		? new RemoteEngine()
		: new LocalEngine();

export { applyCustomTable } from './tables';
