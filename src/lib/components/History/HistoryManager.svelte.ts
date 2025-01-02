import type { Database } from '$lib/database';
import type { HistoryEntry, HistoryEntryRow } from '$lib/database/types';

export class HistoryManager {
	readonly #db: Database;
	#entries = $state.raw<HistoryEntryRow[]>([]);

	constructor(db: Database) {
		this.#db = db;

		$effect(() => {
			this.#loadEntries();
		});
	}

	async #loadEntries() {
		try {
			this.#entries = (await this.#db.exec(
				'SELECT * FROM history ORDER BY timestamp DESC'
			)) as HistoryEntryRow[];
		} catch (error) {
			console.error('Failed to load history entries:', error);
			this.#entries = [];
		}
	}

	get entries() {
		return this.#entries;
	}

	public async push(entry: HistoryEntry) {
		try {
			const [row] = (await this.#db.exec(
				'INSERT INTO history (content, execution_time, total_rows) VALUES (?, ?, ?) RETURNING *',
				[entry.content, entry.execution_time, entry.total_rows]
			)) as [HistoryEntryRow];
			this.#entries = [row, ...this.#entries];
		} catch (error) {
			console.error('Failed to add history entry:', error);
		}
	}

	public async clear() {
		try {
			await this.#db.exec('delete from history');
			this.#entries = [];
		} catch (error) {
			console.error('Failed to clear history:', error);
		}
	}
}
