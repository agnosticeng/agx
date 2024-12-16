<script lang="ts">
	import type { ColumnDescriptor } from '$lib/types';
	import { EditorView } from '@codemirror/view';
	import './codemirror.css';
	import { schema_to_completions } from './utils';
	import type { Workspace } from './Workspace.svelte';

	type Props = {
		workspace: Workspace;
		schema?: { [table_name: string]: ColumnDescriptor[] };
	};

	let { workspace, schema = {} }: Props = $props();

	let container: HTMLDivElement;
	let editor_view: EditorView;
	const sql_schema = $derived(schema_to_completions(schema));

	$effect(() => {
		editor_view = new EditorView({
			parent: container
		});

		workspace.link(editor_view);

		return () => {
			workspace.unlink(editor_view);
			editor_view.destroy();
		};
	});

	$effect(() => {
		if (editor_view) workspace.update_completions(sql_schema);
	});
</script>

<div bind:this={container}></div>

<style>
	div {
		width: 100%;
		height: 100%;
		padding: 7px 2px;
		background-color: hsl(0deg 0% 5%);
	}
</style>
