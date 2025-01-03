import MIGRATIONS_TABLE from './migrations_table.sql?raw';

interface IDatabase {
	exec: (query: string, params?: any[]) => Promise<any[]>;
}

export interface Migration {
	name: string;
	script: string;
}

export class MigrationManager {
	constructor(private database: IDatabase) {}

	async migrate(migrations: Migration[]) {
		await this.init();

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

	private async init() {
		await this.database.exec(MIGRATIONS_TABLE);
	}

	private async migrateOne(migration: Migration) {
		const hashValue = await hash(migration.script);
		const [row] = await this.database.exec('SELECT hash FROM migrations WHERE name = ?', [
			migration.name
		]);

		if (row && row.hash !== hashValue) {
			throw new Error(`Migration ${migration.name} has been modified`);
		}

		if (!row) {
			await this.database.exec(migration.script);
			await this.database.exec('INSERT INTO migrations (name, hash) VALUES (?, ?)', [
				migration.name,
				hashValue
			]);
		}
	}
}

async function hash(input: string) {
	const hashBuffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input));
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}
