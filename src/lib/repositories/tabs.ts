import type { Database } from '$lib/store/database';

export interface Tab {
	id: string;
	name: string;
	content: string;
	query_id?: number;
}

export interface TabRepository {
	get(): Promise<[tabs: Tab[], activeIndex: number]>;
	save(tabs: Tab[], activeIndex: number): Promise<void>;
	count(): Promise<number>;
	insert(tab: Tab, upfront?: boolean): Promise<void>;
}

export class SQLiteTabRepository implements TabRepository {
	constructor(private db: Database) {}

	async get(): Promise<[tabs: Tab[], activeIndex: number]> {
		const rows = await this.db.exec('select * from tabs order by tab_index');
		let index = rows.findIndex((r) => r.active);
		return [rows.map(row_to_tab), Math.max(0, index)];
	}

	async save(tabs: Tab[], activeIndex: number): Promise<void> {
		const rows = tabs.map((tab, tab_index) => ({ ...tab, tab_index }));

		await this.db.exec(
			`DELETE FROM tabs;
INSERT INTO tabs (id, name, content, query_id, tab_index, active)
VALUES ${Array.from({ length: rows.length }).fill('(?,?,?,?,?,?)').join(',\n')}
`,
			rows
				.map((r) => [
					r.id,
					r.name,
					r.content,
					r.query_id ?? null,
					r.tab_index,
					r.tab_index === activeIndex || null
				])
				.flat()
		);
	}

	async count(): Promise<number> {
		const [{ count }] = await this.db.exec('SELECT COUNT(*) as count FROM tabs');

		return count as number;
	}

	async insert({ id, content, name, query_id }: Tab, upfront = true): Promise<void> {
		try {
			await this.db.exec('BEGIN TRANSACTION');

			let index = 0;
			if (upfront) {
				await this.db.exec('UPDATE tabs SET tab_index = tab_index + 1, active = NULL');
			} else {
				await this.db.exec('UPDATE tabs SET active = NULL');
				index = await this.count();
			}

			await this.db.exec(
				'INSERT INTO tabs (id, name, content, query_id, tab_index, active) VALUES (?,?,?,?,?,?)',
				[id, name, content, query_id, index, true]
			);

			await this.db.exec('COMMIT');
		} catch (e) {
			await this.db.exec('ROLLBACK');
			console.error(e);
		}
	}
}

function row_to_tab(row: Awaited<ReturnType<Database['exec']>>[number]): Tab {
	return {
		id: row.id as string,
		content: row.content as string,
		name: row.name as string,
		query_id: row.query_id as number | undefined
	};
}
