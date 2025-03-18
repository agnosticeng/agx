import type { Database } from '$lib/database';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export interface Query {
	id: number;
	name: string;
	sql: string;

	createdAt: Date;
	updatedAt: Date;
}

export interface QueryRepository {
	getAll(): Promise<Query[]>;
	getById(id: number): Promise<Query>;
	create(name: string, sql: string): Promise<Query>;
	update(query: Query): Promise<Query>;
	delete(id: number): Promise<void>;
}

export class SQLiteQueryRepository implements QueryRepository {
	constructor(private db: Database) {}

	async getAll(): Promise<Query[]> {
		const rows = await this.db.exec('SELECT * FROM queries');
		return rows.map((row) => row_to_query(row));
	}

	async getById(id: number): Promise<Query> {
		const [row] = await this.db.exec('SELECT * FROM queries WHERE id = ?', [id]);
		if (!row) throw Error('Query not found');
		return row_to_query(row);
	}

	async create(name: string, sql: string): Promise<Query> {
		const [row] = await this.db.exec('INSERT INTO queries (name, sql) VALUES (?, ?) RETURNING *', [
			name,
			sql
		]);

		if (!row) throw Error('Failed to insert query');

		return row_to_query(row);
	}

	async update(query: Query): Promise<Query> {
		const [row] = await this.db.exec(
			'UPDATE queries SET name = ?, sql = ? WHERE id = ? RETURNING *',
			[query.name, query.sql, query.id]
		);

		if (!row) throw Error('Failed to update query');

		return row_to_query(row);
	}

	async delete(id: number): Promise<void> {
		await this.db.exec('DELETE FROM queries WHERE id = ?', [id]);
	}
}

function row_to_query(row: Awaited<ReturnType<Database['exec']>>[number]): Query {
	return {
		id: row.id as number,
		name: row.name as string,
		sql: row.sql as string,
		createdAt: dayjs(row.created_at as string)
			.utc(true)
			.toDate(),
		updatedAt: dayjs(row.updated_at as string)
			.utc(true)
			.toDate()
	};
}
