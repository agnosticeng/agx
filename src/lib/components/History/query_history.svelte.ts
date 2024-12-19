import type { CHResponse } from '$lib/ch-engine';
import type { SQLiteDB } from '$lib/database';

interface Entry {
	id: string;
	timestamp: string;
	content: string;
	response?: CHResponse;
	query_id?: string;
	query_hash: string;
	stats_execution_time: number;
	stats_total_rows: number;
}

const INSERT_SQL = `
insert into history (content, response, query_hash, stats_execution_time, stats_total_rows)
values ($1, $2, $3, $4, $5)
returning *
`;

export class QueryHistory {
	#db: SQLiteDB;

	#entries = $state.raw<Entry[]>([]);

	#onselect: (entry: Entry) => void;

	get entries() {
		return this.#entries;
	}

	constructor(db: SQLiteDB, { onselect }: { onselect?: (entry: Entry) => void } = {}) {
		this.#db = db;

		this.#onselect = onselect ?? (() => {});

		$effect(() => {
			if (this.#db.ready) {
				this.fetch();
			}
		});
	}

	async fetch() {
		const entries = (await this.#db.exec('select * from history order by timestamp')) as Array<
			Entry & { response: string }
		>;

		this.#entries = entries?.map((e: Entry & { response: string }) => ({
			...e,
			response: JSON.parse(e.response)
		}));
	}

	async push(entry: { content: string; response?: CHResponse; query_id?: string }) {
		const [result] = (await this.#db.exec(INSERT_SQL, [
			entry.content,
			entry.response ? JSON.stringify(entry.response) : undefined,
			await hash(entry.content),
			(entry.response?.statistics.elapsed ?? 0) * 1000,
			entry.response?.rows ?? 0
		])) as [Entry & { response: string }] | [];

		if (result)
			this.#entries = [{ ...result, response: JSON.parse(result.response) }, ...this.#entries];
	}

	/** temporary solution */
	select(entry: Entry) {
		const index = this.#entries.indexOf(entry);
		if (index === -1) throw new Error('Tried to select unknown entry');
		this.#onselect(entry);
	}
}

async function hash(str: string) {
	const buf = new TextEncoder().encode(str);
	const hashBuffer = await window.crypto.subtle.digest('SHA-256', buf);
	const hashArray = Array.from(new Uint8Array(hashBuffer));
	const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
	return hashHex;
}
