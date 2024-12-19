import type { SQLiteDB } from './types';

export interface Migration {
	name: string;
	version: number;
	content: string;
}

const MIGRATIONS_TABLE = `
CREATE TABLE IF NOT EXISTS migrations (
	name TEXT NOT NULL,
	version INTERGER,
	content TEXT NOT NULL,
	executed_at TEXT NOT NULL DEFAULT (datetime('now'))
)`;

export class Migrator {
	#db: SQLiteDB;
	#migrations: Migration[];

	constructor(db: SQLiteDB, migrations: Migration[]) {
		this.#db = db;

		if (!is_uniq(migrations, (m) => m.version))
			throw new TypeError('Migration version must be uniq');

		this.#migrations = migrations.toSorted((a, b) => a.version - b.version);

		$effect(() => {
			if (this.#db.ready)
				this.#create_migrations_table()
					.then(() => this.#execute_migrations())
					.catch((err) => {
						console.error('Migration not executed', err);
					});
		});
	}

	get db() {
		return this.#db;
	}

	async #create_migrations_table() {
		await this.#db.exec(MIGRATIONS_TABLE);
	}

	async #execute_migrations() {
		const version = await this.get_version();
		const index = this.#migrations.findIndex((m) => m.version === version);

		const migrations = index === -1 ? this.#migrations : this.#migrations.slice(index + 1);

		for (const migration of migrations) await this.#db.exec(migration.content);

		if (migrations.length) await this.#update_migration_version(migrations[migrations.length - 1]);
	}

	async get_version(): Promise<number | undefined> {
		const data = await this.#db.exec(`select version from migrations order by executed_at desc`);
		return data?.[0]?.version;
	}

	async #update_migration_version(migration: Migration) {
		await this.#db.exec(
			'DELETE FROM migrations; INSERT INTO migrations (name, version, content) VALUES ($1, $2, $3)',
			[migration.name, migration.version, migration.content]
		);
	}
}

function is_uniq<T, V>(array: T[], predicate: (element: T) => V) {
	const set = new Set<V>();

	for (const element of array) {
		const value = predicate(element);
		if (set.has(value)) return false;
		set.add(value);
	}

	return true;
}
