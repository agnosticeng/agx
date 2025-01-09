<script lang="ts">
	import type { Table } from '$lib/olap-engine';
	import { EditorView } from '@codemirror/view';
	import './codemirror.css';
	import { schema_to_completions, sources_to_schema } from './utils';
	import type { Workspace } from './workspace.svelte';

	type Props = {
		workspace: Workspace;
		tables?: Table[];
	};

	let { workspace, tables = [] }: Props = $props();

	let container: HTMLDivElement;
	let editor_view: EditorView;
	const sql_schema = $derived(schema_to_completions(sources_to_schema(tables)));

	$effect(() => {
		editor_view = new EditorView({ parent: container });
		workspace.link(editor_view);

		return () => {
			workspace.unlink(editor_view);
			editor_view.destroy();
		};
	});

	$effect(() => workspace.update_schema_completion(sql_schema));
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
