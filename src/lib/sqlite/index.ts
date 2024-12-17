import init from '@sqlite.org/sqlite-wasm';
import type { JsStorageDb, SqlValue } from '@sqlite.org/sqlite-wasm';

type Row = SqlValue[];

class SqliteDb {
	private db: JsStorageDb | undefined;

	async init() {
		const sqlite3 = await init({ print: console.log, printErr: console.error });
		this.db = new sqlite3.oo1.JsStorageDb('local');
		return this;
	}

	exec(
		sql:
			| string
			| {
					sql: string;
					bind?: any[];
					rowMode?: string;
			  }
	): Promise<Row[]> {
		if (!this.db) throw new Error('Database not initialized');
		return new Promise<Row[]>((resolve) => {
			const rows: Row[] = [];
			this.db?.exec({
				...(typeof sql === 'string' ? { sql } : sql),
				callback: (row: SqlValue) => {
					rows.push(row as unknown as Row);
					return;
				},
				rowMode: 'array' as const
			});
			resolve(rows);
		});
	}
}

const db = new SqliteDb();

(async () => {
	try {
		await db.init();

		await db.exec(`CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, query TEXT NOT NULL);`);

		await Promise.all(
			Array.from({ length: 3 }, () => `Item-${~~(Math.random() * 1000)}`).map((i) =>
				db.exec({ sql: 'INSERT INTO logs (query) VALUES (?);', bind: [i] })
			)
		);

		const rows = await db.exec({
			sql: 'SELECT * FROM logs;',
			rowMode: 'array'
		});

		console.log(rows);
	} catch (e) {
		console.error('Error:', e);
	}
})();
