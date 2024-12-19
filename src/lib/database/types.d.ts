import type { BindingSpec } from '@sqlite.org/sqlite-wasm';

export interface SQLiteDB {
	readonly ready: boolean;

	exec(sql: string, bind?: BindingSpec): Promise<Array<{ [column: string]: any }> | undefined>;
}
