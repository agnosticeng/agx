import { IndexedDBCache } from '@agnosticeng/cache';
import { SQLite } from '@agnosticeng/sqlite';
import type { BindingSpec } from '@sqlite.org/sqlite-wasm';
import debounce from 'p-debounce';

const DB_NAME = 'sqlite-storage';
const STORE_NAME = 'sqlite-data';
const CACHE_KEY = 'db';

export class Database {
	private db = new SQLite();
	private cache = new IndexedDBCache({ dbName: DB_NAME, storeName: STORE_NAME });
	private cache_key: string;

	private init_promise: Promise<void>;

	constructor() {
		const instanceID = new URLSearchParams(window.location.search).get('instance-id');
		this.cache_key = instanceID ? `${CACHE_KEY}-${instanceID}` : CACHE_KEY;
		this.init_promise = this.init();
	}

	private async init() {
		const snapshot = await this.cache.get(this.cache_key);
		if (snapshot) await this.db.load_db(snapshot);

		this.db.on('exec', debounce(this.snapshot.bind(this), 1000));
	}

	private async snapshot() {
		await this.cache.set(this.cache_key, await this.db.export_db());
	}

	async exec(sql: string, bind?: BindingSpec) {
		await this.init_promise;
		return this.db.exec(sql, bind);
	}
}
