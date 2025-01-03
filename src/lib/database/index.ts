import { SQLite } from '@agnosticeng/sqlite';
import type { BindingSpec, FlexibleString } from '@sqlite.org/sqlite-wasm';
import { SnapshotManager } from './SnapshotManager';

export class Database {
	#db = new SQLite();
	#snapshot_manager = new SnapshotManager();

	#init_promise: Promise<void>;

	constructor() {
		this.#init_promise = this.#init();
	}

	async #init() {
		const storedData = await this.#snapshot_manager.get();
		if (storedData) {
			await this.#db.load_db(storedData);
		}
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
