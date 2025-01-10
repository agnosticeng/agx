<script lang="ts">
	import { ContextMenuState } from '$lib/components/ContextMenu';
	import ContextMenu from '$lib/components/ContextMenu/ContextMenu.svelte';
	import Drawer from '$lib/components/Drawer.svelte';
	import { Editor, Workspace, type File } from '$lib/components/Editor';
	import FileTabs from '$lib/components/FileTabs.svelte';
	import { SaveQueryModal } from '$lib/components/Queries';
	import Result from '$lib/components/Result.svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import { set_app_context } from '$lib/context';
	import Bars3 from '$lib/icons/Bars3.svelte';
	import Play from '$lib/icons/Play.svelte';
	import Save from '$lib/icons/Save.svelte';
	import type { Table } from '$lib/olap-engine';
	import { engine, type OLAPResponse } from '$lib/olap-engine';
	import { history_repository, type HistoryEntry } from '$lib/repositories/history';
	import { query_repository, type Query } from '$lib/repositories/queries';
	import { remove, replace } from '$lib/utils/array';
	import { SplitPane } from '@rich_harris/svelte-split-pane';
	import type { ComponentProps } from 'svelte';

	let response = $state.raw<OLAPResponse>();
	let loading = $state(false);

	async function handleExec() {
		const query = workspace.current.contents;
		if (loading || !query) {
			return;
		}

		loading = true;

		response = await engine.exec(query).finally(() => (loading = false));

		const last = await history_repository.getLast();

		if (response && last?.content !== query) {
			await addHistoryEntry(query);
		}
	}

	let tables = $state.raw<Table[]>([]);
	let history = $state.raw<HistoryEntry[]>([]);
	let queries = $state.raw<Query[]>([]);

	$effect(() => {
		engine.getSchema().then((t) => {
			tables = t;
		});
	});

	$effect(() => {
		history_repository.getAll().then((entries) => {
			history = entries;
		});
	});

	async function addHistoryEntry(query: string) {
		try {
			const entry = await history_repository.add(query);
			history = [entry, ...history];
		} catch (e) {
			console.error(e);
		}
	}

	function handleHistoryClick(entry: HistoryEntry) {
		if (!workspace.current.contents)
			workspace.update({ ...workspace.current, contents: entry.content });
		else workspace.add({ id: crypto.randomUUID(), name: 'Untitled', contents: entry.content });

		if (is_mobile) open_drawer = false;
	}

	$effect(() => {
		query_repository.getAll().then((q) => (queries = q));
	});

	let save_query_modal = $state<ReturnType<typeof SaveQueryModal>>();

	function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 's' && event.metaKey) {
			if (workspace.current.contents) {
				event.preventDefault();
				save_query_modal?.show();
			}
		}

		if (event.key === 'Enter' && event.metaKey) {
			handleExec();
		}
	}

	async function handleCreateQuery({
		name
	}: Parameters<NonNullable<ComponentProps<typeof SaveQueryModal>['onCreate']>>['0']) {
		const query = await query_repository.create(name, workspace.current.contents);
		queries = queries.concat(query);
		workspace.replace(workspace.current, {
			id: `query_${query.id}`,
			name: query.name,
			contents: query.sql
		});
	}

	async function handleDeleteQuery(query: Query) {
		await query_repository.delete(query.id);
		queries = remove(queries, queries.indexOf(query));
	}

	function handleQueryOpen(query: Query) {
		const workspace_id = `query_${query.id}`;
		const opened = workspace.files.find((f) => f.id === workspace_id);
		if (opened) workspace.select(`query_${query.id}`);
		else if (!workspace.current.contents)
			workspace.replace(workspace.current, {
				id: workspace_id,
				name: query.name,
				contents: query.sql
			});
		else workspace.add({ id: workspace_id, name: query.name, contents: query.sql });

		if (is_mobile) open_drawer = false;

		workspace.focus();
	}

	async function handleQueryRename(query: Query) {
		const updated = await query_repository.update(query);
		const index = queries.findIndex((query) => query.id === updated.id);
		if (index !== -1) queries = replace(queries, index, updated);

		const workspace_id = `query_${updated.id}`;
		const file = workspace.files.find((f) => f.id === workspace_id);
		if (file) workspace.rename(file, updated.name);
	}

	async function handleSaveQuery() {
		if (workspace.current.id.startsWith('query_')) {
			const id = parseInt(workspace.current.id.replace(/^query_/, ''), 10);
			const index = queries.findIndex((query) => query.id === id);
			if (index !== -1) {
				const updated = await query_repository.update({
					...queries[index],
					sql: workspace.current.contents
				});
				queries = replace(queries, index, updated);
				return;
			}
		}

		save_query_modal?.show();
	}

	const context_menu = new ContextMenuState();
	set_app_context({ context_menu });

	let screen_width = $state(0);
	let is_mobile = $derived(screen_width < 768 && PLATFORM === 'WEB');
	let open_drawer = $state(false);

	$effect(() => {
		if (!is_mobile) open_drawer = false;
	});

	const dummy: File = {
		id: crypto.randomUUID(),
		name: 'Untitled',
		contents: ''
	};

	const workspace = new Workspace([dummy], { placeholder: 'Enter query...' });
</script>

<svelte:window onkeydown={handleKeyDown} bind:innerWidth={screen_width} />

<ContextMenu state={context_menu} />

{#snippet sidebar()}
	<SideBar
		{tables}
		{history}
		onHistoryClick={handleHistoryClick}
		{queries}
		onQueryDelete={handleDeleteQuery}
		onQueryOpen={handleQueryOpen}
		onQueryRename={handleQueryRename}
	/>
{/snippet}

<section class="screen">
	{#if is_mobile}
		<Drawer bind:open={open_drawer} width={242}>
			{@render sidebar()}
		</Drawer>
	{/if}
	<SplitPane
		type="horizontal"
		disabled={is_mobile}
		pos={is_mobile ? '0px' : '242px'}
		min={is_mobile ? '0px' : '242px'}
		max="40%"
		--color="hsl(0deg 0% 12%)"
	>
		{#snippet a()}
			{#if !is_mobile}
				{@render sidebar()}
			{/if}
		{/snippet}
		{#snippet b()}
			<SplitPane type="vertical" min="20%" max="80%" --color="hsl(0deg 0% 12%)">
				{#snippet a()}
					<div>
						<nav class="Tabs">
							<div class="left">
								{#if is_mobile}
									<button onclick={() => (open_drawer = true)}>
										<Bars3 size="12" />
									</button>
								{/if}
								<FileTabs {workspace} />
							</div>
							<div class="right">
								<button onclick={handleSaveQuery} disabled={!workspace.current.contents}>
									<Save size="12" />
								</button>
								<button onclick={handleExec} disabled={loading}><Play size="12" /></button>
							</div>
						</nav>
						<div>
							<Editor {workspace} {tables} />
						</div>
					</div>
				{/snippet}
				{#snippet b()}
					<Result {response} />
				{/snippet}
			</SplitPane>
		{/snippet}
	</SplitPane>
</section>

<SaveQueryModal bind:this={save_query_modal} onCreate={handleCreateQuery} />

<style>
	.Tabs {
		height: 28px;
		position: relative;
		display: flex;
		gap: 0.5rem;
		align-items: center;
		padding: 0 1rem 0 0;

		&::before {
			content: '';
			position: absolute;
			width: 100%;
			height: 1px;
			bottom: 0px;
			left: 0;
			background-color: hsl(0deg 0% 20%);
			z-index: 1;
		}

		& > .left {
			height: 100%;
			flex: 1;
			overflow-x: hidden;
		}

		& > .right {
			display: flex;
			gap: 2px;
		}

		& button {
			height: 100%;
			background-color: transparent;
			border-radius: 0;
		}

		& ~ div {
			height: calc(100% - 28px);
		}
	}

	button {
		appearance: none;
		outline: none;
		border: none;
		font-size: 10px;
		font-weight: 500;
		background-color: hsl(0deg 0% 9%);
		padding: 4px 10px;
		border-radius: 3px;

		&:is(:hover, :focus-within):not(:disabled) {
			cursor: pointer;
		}
	}

	.screen {
		height: 100vh;
		width: 100vw;
	}
</style>
