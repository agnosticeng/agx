import { IndexedDBCache } from '@agnosticeng/cache';

const DB_NAME = 'sqlite-storage';
const STORE_NAME = 'sqlite-data';

export class SnapshotManager {
	#cache: IndexedDBCache;
	#key: string;

	constructor(key = 'db') {
		this.#cache = new IndexedDBCache({ dbName: DB_NAME, storeName: STORE_NAME });
		this.#key = key;
	}

	async get(): Promise<Uint8Array | null> {
		return this.#cache.get(this.#key);
	}

	async set(value: Uint8Array): Promise<void> {
		return this.#cache.set(this.#key, value);
	}
}
