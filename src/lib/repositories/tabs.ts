import type { Database } from '$lib/database';

export interface Tab {
	id: string;
	name: string;
	content: string;
	query_id?: number;
}

export interface TabRepository {
	get(): Promise<[tabs: Tab[], activeIndex: number]>;
	save(tabs: Tab[], activeIndex: number): Promise<void>;
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
VALUES ${Array.from({ length: rows.length }).fill('(?,?,?,?,?, ?)').join(',\n')}
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
}

function row_to_tab(row: Awaited<ReturnType<Database['exec']>>[number]): Tab {
	return {
		id: row.id as string,
		content: row.content as string,
		name: row.name as string,
		query_id: row.query_id as number | undefined
	};
}
