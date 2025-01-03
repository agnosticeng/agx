import { SQLite } from '@agnosticeng/sqlite';
import type { BindingSpec, FlexibleString } from '@sqlite.org/sqlite-wasm';
import { SnapshotManager } from './SnapshotManager';
import { MigrationManager, migrations } from './migrations';

export class Database {
	#db = new SQLite();
	#snapshot_manager = new SnapshotManager();

	#init_promise: Promise<void>;

	constructor() {
		this.#init_promise = this.#init();
	}

	async #init() {
		await this.#load();
	}

	async #load() {
		const storedData = await this.#snapshot_manager.get();
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
		await this.#snapshot_manager.set(data);
	}
}
