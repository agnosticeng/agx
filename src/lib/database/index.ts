import { SQLite } from '@agnosticeng/sqlite';
import type { BindingSpec, FlexibleString } from '@sqlite.org/sqlite-wasm';
import * as IndexedDBWrapper from './IndexedDBWrapper';
import { MigrationManager, migrations } from './migrations';

export class Database {
	#db: SQLite;

	#init_promise: Promise<void>;

	constructor() {
		this.#db = new SQLite();

		this.#init_promise = this.#init();
	}

	async #init() {
		await this.#load();
	}

	async #load() {
		const storedData = await IndexedDBWrapper.getData();
		if (storedData) {
			await this.#db.load_db(storedData);
		}

		const migrator = new MigrationManager(this.#db);
		await migrator.migrate(migrations);
	}

	async exec(query: FlexibleString, bind?: BindingSpec) {
		await this.#init_promise;
		try {
			return await this.#db.exec(query, bind);
		} finally {
			await this.#save();
		}
	}

	async #save() {
		const data = await this.#db.export_db();
		await IndexedDBWrapper.setData(data);
	}
}
