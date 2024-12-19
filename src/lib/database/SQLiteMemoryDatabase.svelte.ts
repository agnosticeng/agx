import sqlite3InitModule, { type BindingSpec, type Database } from '@sqlite.org/sqlite-wasm';
import { Migrator } from './Migrator.svelte';
import { migrations } from './migrations';

export class SQLiteDatabase {
	#opened = $state(false);
	#db?: Database;
	#migrator: Migrator;

	get opened() {
		return this.#opened;
	}

	get ready() {
		return this.#migrator.done;
	}

	constructor() {
		this.#initialize()
			.then(() => (this.#opened = true))
			.catch((e) => console.error('Error during SQLiteDatabase initialization', e));

		this.#migrator = new Migrator(this, migrations);
	}

	async #initialize() {
		const sqlite = await sqlite3InitModule();
		this.#db = new sqlite.oo1.DB('/database.db', 'c');
	}

	async exec(sql: string, bind?: BindingSpec) {
		if (!this.#opened) throw new Error('Must be initialized before exec');
		return this.#db!.exec(sql, { bind, rowMode: 'object', returnValue: 'resultRows' });
	}
}
