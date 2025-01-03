import type { SQLite } from '@agnosticeng/sqlite';

export interface Migration {
	name: string;
	script: string;
}

export class MigrationManager {
	private database: SQLite;
	private readonly migration_script = `
    CREATE TABLE IF NOT EXISTS migrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      hash TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_migrations_name ON migrations (name);
  `;

	private initPromise: Promise<void>;

	constructor(database: SQLite) {
		this.database = database;

		this.initPromise = this.init();
	}

	async init() {
		await this.database.exec(this.migration_script);
	}

	async migrate(migrations: Migration[]) {
		await this.initPromise;

		try {
			await this.database.exec('BEGIN TRANSACTION');
			for (const migration of migrations) {
				await this.migrateOne(migration);
			}
			await this.database.exec('COMMIT');
		} catch (error) {
			await this.database.exec('ROLLBACK');
			throw error;
		}
	}

	private async migrateOne(migration: Migration) {
		const hashValue = await hash(migration.script);
		const [row] = await this.database.exec('SELECT hash FROM migrations WHERE name = ?', [
			migration.name
		]);

		if (!row) {
			await this.database.exec(migration.script);
			await this.database.exec('INSERT INTO migrations (name, hash) VALUES (?, ?)', [
				migration.name,
				hashValue
			]);
		}

		if (row && row.hash !== hashValue) {
			throw new Error(`Migration ${migration.name} has been modified`);
		}
	}
}

async function hash(str: string) {
	const buf = new TextEncoder().encode(str);
	const hashBuffer = await window.crypto.subtle.digest('SHA-256', buf);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
}
