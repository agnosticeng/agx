import { fs } from '@tauri-apps/api';
import { BaseDirectory, readTextFile } from '@tauri-apps/api/fs';

export interface QueryHistoryEntry {
	timestamp: number;
	content: string;
	path: string;
}

export interface HistorySource {
	readonly entries: QueryHistoryEntry[];
	init(): Promise<void>;
	push(content: string): Promise<void>;
	remove(entry: QueryHistoryEntry): Promise<void>;
}

export class QueryHistorySource implements HistorySource {
	#entries = $state.raw<QueryHistoryEntry[]>([]);
	#base_dir = BaseDirectory.AppLocalData;
	#dir_name = 'history';
	#initied = false;

	constructor() {}

	get entries() {
		return this.#entries;
	}

	async init() {
		const exist = await fs.exists(this.#dir_name, { dir: this.#base_dir });
		if (!exist) {
			await fs.createDir(this.#dir_name, { dir: this.#base_dir, recursive: true });
		}

		const entries = await fs.readDir(this.#dir_name, { dir: this.#base_dir, recursive: true });
		const unsorted_entries = await this.#proceed_entries(entries);
		this.#entries = unsorted_entries.toSorted((a, b) => b.timestamp - a.timestamp);

		this.#initied = true;
	}

	async #proceed_entries(entries: fs.FileEntry[]) {
		const history_entries: QueryHistoryEntry[] = [];

		for (const entry of entries) {
			if (!entry.name) continue;

			const timestamp = parseInt(entry.name.replace('.sql', ''));
			if (is_valid_date(timestamp) && !entry.children) {
				const content = await readTextFile(entry.path);
				history_entries.push({ timestamp, content, path: entry.path });
			}

			if (entry.children) history_entries.push(...(await this.#proceed_entries(entry.children)));
		}

		return history_entries;
	}

	async push(content: string) {
		if (!this.#initied) throw new Error('Failed to Add entry: must be initiated first');
		const timestamp = Date.now();
		const path = this.#dir_name + '/' + timestamp + '.sql';

		await fs.writeTextFile(path, content, { dir: this.#base_dir });
		const last = { timestamp, content, path };

		this.#entries = [last, ...this.#entries];
	}

	async remove(entry: QueryHistoryEntry) {
		const index = this.#entries.indexOf(entry);
		if (index === -1)
			throw new Error('Tried to remove an entry that does not exist in the history');

		await fs.removeFile(entry.path, { dir: this.#base_dir });

		this.#entries = [...this.#entries.slice(0, index), ...this.#entries.slice(index + 1)];
	}
}

function is_valid_date(d: number | Date) {
	return !Number.isNaN(new Date(d).getTime());
}
