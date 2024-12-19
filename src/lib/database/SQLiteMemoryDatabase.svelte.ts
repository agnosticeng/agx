import sqlite3InitModule, { type BindingSpec, type Database } from '@sqlite.org/sqlite-wasm';
import { Migrator } from './Migrator.svelte';
import { migrations } from './migrations';

export class SQLiteDatabase {
	#ready = $state(false);
	#db?: Database;

	get ready() {
		return this.#ready;
	}

	constructor() {
		this.#initialize()
			.then(() => (this.#ready = true))
			.catch((e) => console.error('Error during SQLiteDatabase initialization', e));

		new Migrator(this, migrations);
	}

	async #initialize() {
		const sqlite = await sqlite3InitModule();
		this.#db = new sqlite.oo1.DB('/database.db', 'c');
	}

	async exec(sql: string, bind?: BindingSpec) {
		if (!this.#ready) throw new Error('Must be initialized before exec');
		return this.#db!.exec(sql, { bind, rowMode: 'object', returnValue: 'resultRows' });
	}
}
