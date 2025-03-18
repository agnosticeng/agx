import type { Database } from '$lib/database';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export interface HistoryEntry {
	id: number;
	content: string;
	timestamp: Date;
}

export interface HistoryRepository {
	getAll(): Promise<HistoryEntry[]>;
	add(content: string): Promise<HistoryEntry>;
	getLast(): Promise<HistoryEntry | null>;
	delete(id: HistoryEntry['id']): Promise<void>;
}

export class SQLiteHistoryRepository implements HistoryRepository {
	constructor(private db: Database) {}

	async getAll(): Promise<HistoryEntry[]> {
		const rows = await this.db.exec('SELECT * FROM history ORDER BY timestamp DESC');
		return rows.map((row) => ({
			id: row.id as number,
			content: row.content as string,
			timestamp: dayjs(row.timestamp as string)
				.utc(true)
				.toDate()
		}));
	}

	async getLast(): Promise<HistoryEntry | null> {
		const [row] = await this.db.exec('SELECT * FROM history ORDER BY timestamp DESC LIMIT 1');
		if (!row) return null;
		return {
			id: row.id as number,
			content: row.content as string,
			timestamp: dayjs(row.timestamp as string)
				.utc(true)
				.toDate()
		};
	}

	async add(content: string): Promise<HistoryEntry> {
		const [row] = await this.db.exec('INSERT INTO history (content) VALUES (?) RETURNING *', [
			content
		]);

		if (!row) throw Error('Failed to insert history entry');

		return {
			id: row.id as number,
			content: row.content as string,
			timestamp: dayjs(row.timestamp as string)
				.utc(true)
				.toDate()
		};
	}

	async delete(id: HistoryEntry['id']) {
		await this.db.exec('DELETE FROM history WHERE id = ?', [id]);
	}
}
