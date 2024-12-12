export interface HistoryEntry<T> {
	ts: number;
	state: T;
}

function noop() {}

type UpdateCallback<T> = (this: History<T>, entries: HistoryEntry<T>[]) => unknown;

type Config<T> = { onupdate?: UpdateCallback<T> };

export class History<T> {
	#entries = $state.raw<HistoryEntry<T>[]>([]);
	#onupdate: UpdateCallback<T>;

	constructor(entries: HistoryEntry<T>[], { onupdate = noop }: Config<T> = {}) {
		this.#entries = entries;
		this.#onupdate = onupdate.bind(this);
	}

	get entries() {
		return this.#entries;
	}

	push(state: T) {
		this.#entries = [{ ts: Date.now(), state }, ...this.#entries];
		this.#onupdate(this.#entries);
	}

	pop() {
		let state = this.#entries.at(0);
		this.#entries = this.#entries.slice(1);

		this.#onupdate(this.#entries);

		return state;
	}

	remove(entry: HistoryEntry<T>) {
		const index = this.#entries.indexOf(entry);

		if (index === -1)
			throw new Error('Tried to remove an entry that does not exist in the history');

		this.#entries = [...this.#entries.slice(0, index), ...this.#entries.slice(index + 1)];

		this.#onupdate(this.#entries);
	}
}
