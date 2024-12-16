import { sql, type SQLNamespace } from '@codemirror/lang-sql';
import { indentUnit } from '@codemirror/language';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, placeholder } from '@codemirror/view';
import { untrack } from 'svelte';
import { default_keymaps, default_extensions as extensions } from './extensions';
import { ProxyDialect } from './SQLDialect';

export interface Query {
	name: string;
	contents: string;
}

// Code mirror stuff
const dialect_compartment = new Compartment();
const placeholder_compartment = new Compartment();
const default_extensions = [
	...extensions,
	default_keymaps,
	EditorView.darkTheme.of(true),
	dialect_compartment.of(sql({ dialect: ProxyDialect })),
	placeholder_compartment.of([]),
	indentUnit.of('\t')
];

const noop = () => {};

interface WorkspaceConfig {
	initial?: string;
	onupdate?: (query: Query) => void;
	onreset?: (queries: Query[]) => void;
}

export class Workspace {
	#queries = $state.raw<Query[]>([]);
	#current = $state.raw<Query>()!;

	#onupdate: WorkspaceConfig['onupdate'];
	#onreset: WorkspaceConfig['onreset'];

	#states = new Map<Query['name'], EditorState>();
	#view: EditorView | null = null;

	constructor(queries: Query[], { initial, onreset, onupdate }: WorkspaceConfig = {}) {
		this.set(queries, initial);

		this.#onupdate = onupdate;
		this.#onreset = onreset;
	}

	get queries() {
		return this.#queries;
	}

	get current() {
		return this.#current;
	}

	link(view: EditorView) {
		if (this.#view) throw new Error('view is already linked');
		this.#view = view;

		view.setState(this.#get_state(untrack(() => this.#current)));
	}

	unlink(view: EditorView) {
		if (this.#view !== view) throw new Error('Wrong editor view');
		this.#view = null;
	}

	set(queries: Query[], selected = this.#current?.name) {
		const [first] = queries;
		if (!first) throw new Error('Workspace must have at least one query');

		if (selected) {
			const selected_query = queries.find((q) => q.name === selected);

			if (!selected_query) throw new Error(`Invalid selection ${selected}`);

			this.#select(selected_query);
		} else this.#select(first);

		this.#queries = queries;

		for (const [name, state] of this.#states) {
			const query = queries.find((query) => query.name === name);

			if (query) {
				this.#update_state(query, state);
			} else {
				this.#states.delete(name);
			}
		}

		this.#onreset?.(this.queries);
	}

	select(name: string) {
		const file = this.#queries.find((q) => q.name === name);

		if (!file) throw new Error(`Query ${name} does not exist in workspace`);

		this.#select(file);
	}

	#select(query: Query) {
		this.#current = query;
		this.#view?.setState(this.#get_state(this.#current));
	}

	#get_state(query: Query) {
		let state = this.#states.get(query.name);
		if (state) return state;

		const extensions = [
			...default_extensions,
			EditorView.updateListener.of((update) => {
				if (update.docChanged) {
					const state = update.state;

					this.#update_query({
						...this.#current,
						contents: state.doc.toString()
					});

					this.#states.set(this.#current.name, state);
				}
			})
		];

		state = EditorState.create({
			doc: query.contents,
			extensions
		});

		this.#states.set(query.name, state);

		return state;
	}

	add(query: Query) {
		const existing = this.#queries.find((q) => q.name === query.name);
		if (existing)
			throw new Error(`Tried to add query that already exist on Workspace: ${query.name}`);

		this.#queries = this.#queries.concat(query);

		this.#select(query);
		this.#onreset?.(this.queries);

		return query;
	}

	remove(query: Query) {
		const index = this.#queries.indexOf(query);

		if (index === -1) throw Error('Tried to remove query that does not exist on Workspace');

		let next = this.#current;

		if (next === query) {
			const q = last(this.#queries.slice(0, index)) ?? first(this.#queries.slice(index + 1));

			if (!q) throw new Error('Workspace cannot be empty');

			next = q;
		}

		this.#queries = remove_at(this.#queries, index);
		this.#select(next);

		this.#onreset?.(this.queries);
	}

	rename(previous: Query, new_name: string) {
		const index = this.#queries.indexOf(previous);

		if (index === -1) throw new Error('Tried to rename query that does not exist on Workspace');

		const was_current = this.#current === previous;

		const new_query = {
			...previous,
			name: new_name
		};

		this.#queries = this.#queries.map((old, i) => {
			if (i === index) return new_query;
			return old;
		});

		if (was_current) {
			this.#select(new_query);
		}

		this.#onreset?.(this.#queries);
	}

	update_query(query: Query) {
		this.#update_query(query);

		const state = this.#states.get(query.name);
		if (state) this.#update_state(query, state);
	}

	#update_query(query: Query) {
		if (this.#current?.name === query.name) {
			this.#current = query;
		}

		this.#queries = this.#queries.map((old) => (old.name === query.name ? query : old));

		this.#onupdate?.(query);
	}

	#update_state(query: Query, state: EditorState) {
		const existing = state.doc.toString();

		if (existing !== query.contents) {
			const cursor_position = this.#view?.state.selection.ranges.at(0)?.from!;

			const transaction = state.update({
				changes: {
					from: 0,
					to: existing.length,
					insert: query.contents
				},
				selection: {
					anchor: cursor_position,
					head: cursor_position
				}
			});

			this.#states.set(query.name, transaction.state);

			if (query === this.#current) {
				this.#view?.setState(transaction.state);
			}
		}
	}

	update_completions(schema?: SQLNamespace) {
		this.#view?.dispatch({
			effects: dialect_compartment.reconfigure(sql({ dialect: ProxyDialect, schema }))
		});
	}

	set_placeholder(content: string) {
		this.#view?.dispatch({
			effects: placeholder_compartment.reconfigure(placeholder(content))
		});
	}
}

function remove_at<T>(arr: T[], at: number) {
	return arr.slice(0, at).concat(arr.slice(at + 1));
}

function last<T>(arr: T[]): T | undefined {
	return arr[arr.length - 1];
}

function first<T>(arr: T[]): T | undefined {
	return arr[0];
}
