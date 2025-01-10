import { insert, remove, replace, uniq } from '$lib/utils/array';
import type { Completion } from '@codemirror/autocomplete';
import { sql } from '@codemirror/lang-sql';
import { Compartment, EditorState } from '@codemirror/state';
import { EditorView, placeholder } from '@codemirror/view';
import { untrack } from 'svelte';
import { default_extensions, default_keymaps } from './extensions';
import { ProxyDialect } from './SQLDialect';

export interface File {
	id: string;
	name: string;
	contents: string;
}

const dialect_compartment = new Compartment();

const base_extensions = [
	...default_extensions,
	default_keymaps,
	dialect_compartment.of(sql({ dialect: ProxyDialect }))
];

export class Workspace {
	#placeholder: string;
	#files = $state.raw<File[]>([]);
	#current = $state.raw<File>()!;

	// CodeMirror stuff
	#states = new Map<File['id'], EditorState>();
	#view: EditorView | null = null;

	constructor(
		files: File[],
		{ initial, placeholder = '' }: { initial?: File['id']; placeholder?: string } = {}
	) {
		this.#placeholder = placeholder;
		this.set(files, initial);
	}

	get files() {
		return this.#files;
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

	focus() {
		setTimeout(() => this.#view?.focus());
	}

	add(file: File) {
		const files = this.#files.concat(file);

		if (!uniq(files, (f) => f.id))
			throw new Error(`File ${file.id} already exist in the workspace`);

		this.#files = files;
		this.#select(file);

		return file;
	}

	remove(file: File) {
		const index = this.#files.indexOf(file);

		if (index === -1)
			throw new Error('Tried to remove a file that does not exist in the workspace');

		let next = this.#current;

		if (next === file) {
			const f = this.#files[index - 1] ?? this.#files[index + 1];

			if (!f) throw new Error('Cannot delete the only file');

			next = f;
		}

		this.#files = remove(this.#files, index);

		this.#select(next);
	}

	rename(previous: File, name: string) {
		const index = this.files.indexOf(previous);

		if (index === -1)
			throw new Error('Tried to rename a file that does not exist in the workspace');

		this.#files = replace(this.#files, index, { ...previous, name });
	}

	set(files: File[], selected = this.#current?.id) {
		const [first] = files;

		if (!first) throw new Error('Workspace must have at least one file');
		if (!uniq(files, (f) => f.id)) throw new Error('File ids must be uniq');

		if (selected) {
			const file = files.find((file) => file.id === selected);

			if (!file) throw new Error(`Invalid selection ${selected}`);

			this.#select(file);
		} else {
			this.#select(first);
		}

		this.#files = files;

		for (const [id, state] of this.#states) {
			const file = files.find((file) => file.id === id);

			if (file) {
				this.#update_state(file, state);
			} else {
				this.#states.delete(id);
			}
		}
	}

	move(from: File, to: File) {
		const from_index = this.#files.indexOf(from);
		const to_index = this.#files.indexOf(to);

		if (from_index === -1 || to_index === -1) throw new Error('File not found in workspace');

		this.#files = insert(remove(this.#files, from_index), from, to_index);
	}

	replace(previous: File, next: File) {
		const index = this.#files.indexOf(previous);
		if (index === -1)
			throw new Error('Tried to replace a file that is not present in the workspace');

		const was_current = previous === this.#current;

		this.#states.delete(previous.id);

		this.#files = replace(this.#files, index, next);

		if (was_current) this.#select(next);
	}

	update(file: File) {
		this.#update_file(file);

		const state = this.#states.get(file.id);
		if (state) this.#update_state(file, state);
	}

	select(id: File['id']) {
		const file = this.#files.find((file) => file.id === id);

		if (!file) throw new Error(`File ${id} does not exist in workspace`);

		this.#select(file);
	}

	#select(file: File) {
		this.#current = file as File;
		this.#view?.setState(this.#get_state(this.#current));
	}

	update_schema_completion(schema: { [table_name: string]: Completion[] }) {
		const dialect_extension_index = base_extensions.findIndex(
			// @ts-expect-error jfc CodeMirror is a struggle
			(ext) => ext.compartment === dialect_compartment
		);

		let extension = sql({ dialect: ProxyDialect, schema });

		base_extensions[dialect_extension_index] = dialect_compartment.of(extension);

		this.#view?.dispatch({ effects: dialect_compartment.reconfigure(extension) });

		for (const file of this.#files) {
			if (file === this.#current) continue;
			this.#states.set(file.id, this.#create_state(file));
		}
	}

	#get_state(file: File) {
		return this.#states.get(file.id) ?? this.#create_state(file);
	}

	#create_state(file: File) {
		const state = EditorState.create({
			doc: file.contents,
			extensions: [
				...base_extensions,
				placeholder(this.#placeholder),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						this.#update_file({
							...this.#current,
							contents: update.state.doc.toString()
						});

						this.#states.set(this.#current.id, state);
					}
				})
			]
		});

		this.#states.set(file.id, state);

		return state;
	}

	#update_file(file: File) {
		if (file.id === this.#current.id) {
			this.#current = file;
		}

		const index = this.#files.findIndex((f) => f.id === file.id);
		this.#files = replace(this.#files, index, file);
	}

	#update_state(file: File, state: EditorState) {
		const existing = state.doc.toString();

		if (file.contents !== existing) {
			const current_cursor_position = Math.min(
				this.#view?.state.selection.ranges[0].from!,
				file.contents.length
			);

			const transaction = state.update({
				changes: {
					from: 0,
					to: existing.length,
					insert: file.contents
				},
				selection: {
					anchor: current_cursor_position,
					head: current_cursor_position
				}
			});

			this.#states.set(file.id, transaction.state);

			if (file === this.#current) {
				this.#view?.setState(transaction.state);
			}
		}
	}
}
