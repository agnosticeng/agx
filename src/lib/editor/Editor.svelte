<script lang="ts">
	import { EditorState } from '@codemirror/state';
	import { EditorView, keymap, placeholder } from '@codemirror/view';
	import { sql } from '@codemirror/lang-sql';
	import { default_extensions, default_keymaps } from './extensions';
	import { ProxyDialect } from './SQLDialect';
	import { untrack } from 'svelte';
	import './codemirror.css';

	type Props = {
		value: string;
		onExec?: () => unknown;
	};

	let { value = $bindable(''), onExec }: Props = $props();

	let container: HTMLDivElement;
	let editor_view: EditorView;

	$effect(() => {
		editor_view = new EditorView({ parent: container });

		const state = EditorState.create({
			doc: untrack(() => value),
			extensions: [
				...default_extensions,
				default_keymaps,
				EditorView.darkTheme.of(true),
				sql({ dialect: ProxyDialect }),
				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						value = update.state.doc.toString();
					}
				}),
				placeholder('Enter a query...'),
				keymap.of([
					{
						key: 'Mod-Enter',
						run: () => {
							onExec?.();
							return true;
						}
					}
				])
			]
		});

		editor_view.setState(state);

		return () => editor_view.destroy();
	});
</script>

<div bind:this={container}></div>

<style>
	div {
		width: 100%;
		height: 100%;
	}
</style>
