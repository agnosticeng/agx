<script lang="ts">
	import {
		AiPanel,
		deserializeModel,
		generateFixMessage,
		serializeModel,
		type Chat
	} from '$lib/components/Ai';
	import type { Log } from '$lib/components/Console.svelte';
	import { goToDefinition } from '$lib/components/Datasets';
	import Drawer from '$lib/components/Drawer.svelte';
	import { functions, keywords, operators, types } from '$lib/components/Editor/clickhouse';
	import Editor from '$lib/components/Editor/Editor.svelte';
	import { setupLanguage } from '$lib/components/Editor/language';
	import { SaveQueryModal } from '$lib/components/Queries';
	import Result from '$lib/components/Result.svelte';
	import SideBar from '$lib/components/SideBar.svelte';
	import TabComponent from '$lib/components/Tab.svelte';
	import TimeCounter from '$lib/components/TimeCounter.svelte';
	import { FileDropEventManager } from '$lib/FileDropEventManager';
	import { isResponseTooLarge, LARGE_RESULT } from '$lib/hints';
	import Bars3 from '$lib/icons/Bars3.svelte';
	import Bolt from '$lib/icons/Bolt.svelte';
	import Copy from '$lib/icons/Copy.svelte';
	import MagicWand from '$lib/icons/MagicWand.svelte';
	import PanelBottom from '$lib/icons/PanelBottom.svelte';
	import PanelLeft from '$lib/icons/PanelLeft.svelte';
	import PanelRight from '$lib/icons/PanelRight.svelte';
	import Play from '$lib/icons/Play.svelte';
	import Plus from '$lib/icons/Plus.svelte';
	import Save from '$lib/icons/Save.svelte';
	import Sparkles from '$lib/icons/Sparkles.svelte';
	import Stop from '$lib/icons/Stop.svelte';
	import type { Table } from '$lib/olap-engine';
	import { engine, type OLAPResponse } from '$lib/olap-engine';
	import { PanelState } from '$lib/PanelState.svelte';
	import { SQLiteChatsRepository, type ChatsRepository } from '$lib/repositories/chats';
	import {
		SQLiteHistoryRepository,
		type HistoryEntry,
		type HistoryRepository
	} from '$lib/repositories/history';
	import {
		SQLiteQueryRepository,
		type Query,
		type QueryRepository
	} from '$lib/repositories/queries';
	import { SQLiteTabRepository, type Tab, type TabRepository } from '$lib/repositories/tabs';
	import { Persisted } from '$lib/states/Persisted.svelte';
	import { store } from '$lib/store';
	import { IndexedDBCache } from '@agnosticeng/cache';
	import { SplitPane } from '@rich_harris/svelte-split-pane';
	import debounce from 'p-debounce';
	import { format } from 'sql-formatter';
	import { tick, type ComponentProps } from 'svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();

	const historyRepository: HistoryRepository = new SQLiteHistoryRepository(store);
	const queryRepository: QueryRepository = new SQLiteQueryRepository(store);
	const tabRepository: TabRepository = new SQLiteTabRepository(store);
	const chatsRepository: ChatsRepository = new SQLiteChatsRepository(store);

	let response = $state.raw<OLAPResponse>();
	let loading = $state(false);
	let counter = $state<ReturnType<typeof TimeCounter>>();
	let abortController: AbortController | undefined;
	let warnings = $state.raw<string[]>([]);

	const cache = new IndexedDBCache({ dbName: 'query-cache', storeName: 'response-data' });
	let cached = $state(false);

	async function handleExec(force = false) {
		const query = currentTab.content;
		if (loading || !query) return;

		loading = true;
		counter?.start();
		try {
			if (!force) {
				const r = await cache.get(query);
				if (r) {
					cached = true;
					response = r;
					cached = true;
					bottomPanel.open = true;
					if (bottomPanelTab === 'logs') bottomPanelTab = 'data';
					return;
				}
			}

			cached = false;
			abortController = new AbortController();
			response = await engine.exec(query, { signal: abortController.signal });
			await cache.set(query, response);
		} finally {
			loading = false;
			counter?.stop();
			abortController = undefined;
			if (response && isResponseTooLarge(response)) {
				if (!warnings.includes(LARGE_RESULT)) warnings = warnings.concat(LARGE_RESULT);
			} else warnings = warnings.filter((w) => w !== LARGE_RESULT);
		}
	}

	let tables = $state.raw<Table[]>([]);
	let history = $state.raw<HistoryEntry[]>([]);
	let queries = $state.raw<Query[]>([]);

	async function setupEditor() {
		const [t, udfs] = await Promise.all([engine.getSchema(), engine.getUDFs()]);
		tables = t;

		setupLanguage(
			'clickhouse',
			keywords,
			[...functions, ...udfs],
			types,
			operators,
			tables.map((t) => t.name),
			tables.map((t) => t.columns.map((c) => c.name)).flat()
		);
	}

	setupEditor();

	$effect(() => void historyRepository.getAll().then((entries) => (history = entries)));
	$effect(() => void queryRepository.getAll().then((q) => (queries = q)));

	engine.on('success', async (query: string) => {
		if (typeof query !== 'string') return;
		if (/(CREATE|DROP)/gi.test(query)) tables = await engine.getSchema();
	});

	engine.on('success', async (query: string, response?: OLAPResponse) => {
		const last = await historyRepository.getLast();
		if (response && last?.content !== query) await addHistoryEntry(query);
	});

	engine.on('success', (query: string, response?: OLAPResponse) => {
		if (response) {
			bottomPanel.open = true;
			if (bottomPanelTab === 'logs') bottomPanelTab = 'data';
		}
	});

	async function addHistoryEntry(query: string) {
		try {
			const entry = await historyRepository.add(query);
			history = [entry, ...history];
		} catch (e) {
			console.error(e);
		}
	}

	function handleHistoryOpen(entry: HistoryEntry) {
		if (currentTab.content) {
			selectedTabIndex =
				tabs.push({ id: crypto.randomUUID(), content: entry.content, name: 'Untitled' }) - 1;
		} else tabs[selectedTabIndex] = { ...currentTab, content: entry.content };
		if (isMobile) leftDrawerOpened = false;
	}

	async function handleHistoryDelete(entry: HistoryEntry) {
		const index = history.indexOf(entry);
		await historyRepository.delete(entry.id);
		history = history.toSpliced(index, 1);
	}

	let saveQueryModal = $state<ReturnType<typeof SaveQueryModal>>();

	async function handleKeyDown(event: KeyboardEvent) {
		if (event.key === 's' && event.metaKey) {
			event.preventDefault();
			handleSaveQuery();
		}

		if (event.key === 'Enter' && event.metaKey) handleExec();
		if (event.key === 'i' && event.metaKey) handleFormat();
	}

	async function handleCreateQuery({
		name
	}: Parameters<NonNullable<ComponentProps<typeof SaveQueryModal>['onCreate']>>['0']) {
		const q = await queryRepository.create(name, currentTab.content);
		queries = queries.concat(q);
		tabs[selectedTabIndex] = { ...currentTab, name, query_id: q.id };
	}

	async function handleDeleteQuery(query: Query) {
		await queryRepository.delete(query.id);
		queries = queries.toSpliced(queries.indexOf(query), 1);

		const index = tabs.findIndex((t) => t.query_id === query.id);
		if (index !== -1)
			tabs[index] = { ...tabs[index], query_id: undefined, name: tabs[index].name + ' (deleted)' };
	}

	function handleQueryOpen(query: Query) {
		const index = tabs.findIndex((t) => t.query_id === query.id);
		if (index === -1) {
			if (currentTab.content) {
				selectedTabIndex =
					tabs.push({
						id: crypto.randomUUID(),
						content: query.sql,
						name: query.name,
						query_id: query.id
					}) - 1;
			} else
				tabs[selectedTabIndex] = {
					...currentTab,
					content: query.sql,
					name: query.name,
					query_id: query.id
				};
		} else selectedTabIndex = index;

		if (isMobile) leftDrawerOpened = false;
	}

	async function handleQueryRename(query: Query) {
		const updated = await queryRepository.update(query);
		const index = queries.findIndex((query) => query.id === updated.id);
		if (index !== -1) queries = queries.with(index, updated);

		const tab_index = tabs.findIndex((t) => t.query_id === updated.id);
		if (tab_index !== -1) {
			tabs[tab_index] = { ...tabs[tab_index], name: updated.name, content: updated.sql };
		}
	}

	async function handleSaveQuery() {
		const { content, query_id: query_id } = currentTab;
		if (content && !query_id) {
			return saveQueryModal?.show();
		}

		const index = queries.findIndex((q) => q.id === query_id);
		if (index !== -1) {
			const updated = await queryRepository.update({ ...queries[index], sql: content });
			queries = queries.with(index, updated);
		}
	}

	let screenWidth = $state(0);
	let isMobile = $derived(screenWidth < 768 && PLATFORM === 'WEB');
	let leftDrawerOpened = $state(false);
	let rightDrawerOpened = $state(false);

	$effect(() => {
		if (isMobile) {
			leftPanel.open = false;
			bottomPanel.open = true;
		} else {
			leftPanel.open = true;
		}
	});

	let tabs = $state<Tab[]>([]);
	$effect(
		() =>
			void tabRepository.get().then(([t, active]) => {
				if (t.length) (tabs = t), (selectedTabIndex = active);
				else tabs.push({ id: crypto.randomUUID(), content: '', name: 'Untitled' });
			})
	);

	const saveTabs = debounce(
		(tabs: Tab[], activeIndex: number) => tabRepository.save(tabs, activeIndex),
		2_000
	);

	let tabContainer: HTMLDivElement;
	let selectedTabIndex = $state(0);
	const currentTab = $derived(tabs[selectedTabIndex]);
	const canSave = $derived.by(() => {
		if (!tabs.length) return false;
		if (currentTab.query_id) {
			const query = queries.find((q) => q.id === currentTab.query_id);
			return query?.sql !== currentTab.content;
		}

		return !!currentTab.content;
	});

	function addNewTab() {
		selectedTabIndex = tabs.push({ id: crypto.randomUUID(), name: 'Untitled', content: '' }) - 1;
		tick().then(() => tabContainer.scroll({ left: tabContainer.scrollWidth }));
	}

	function closeTab(index: number) {
		tabs.splice(index, 1);
		selectedTabIndex = Math.max(0, selectedTabIndex - 1);
	}

	$effect(() => void saveTabs($state.snapshot(tabs), selectedTabIndex).catch(console.error));

	const bottomPanel = new PanelState('-50%', false);
	const leftPanel = new PanelState('260px', true);
	const rightPanel = new PanelState('-300px', true);

	let bottomPanelTab = $state<'data' | 'chart' | 'logs'>('data');
	let errors = $state.raw<Log[]>([]);
	engine.on('error', (query: string, e: unknown) => {
		if (e instanceof Error) {
			if (e.message === 'Canceled') return;
			errors = errors.concat({ level: 'error', timestamp: new Date(), data: e.message, query });
			bottomPanel.open = true;
			bottomPanelTab = 'logs';
		}
	});

	function handleFormat() {
		if (!currentTab.content) return;

		currentTab.content = format(currentTab.content, {
			keywordCase: 'lower',
			tabWidth: 2,
			useTabs: true,
			expressionWidth: 80,
			language: 'postgresql'
		});
	}

	const fileManager = new FileDropEventManager();

	fileManager.on('drop', async (file) => {
		switch (file.type) {
			case 'sql':
				openNewTabIfNeeded(await file.content());
				break;
			case 'csv':
				openNewTabIfNeeded(queryForFile(file.path, 'CSV'));
				break;
			case 'parquet':
				openNewTabIfNeeded(queryForFile(file.path, 'Parquet'));
				break;
			default:
				console.warn('Unsupported file');
				break;
		}
	});

	$effect(() => () => fileManager.unlisten());

	function queryForFile(path: string, filetype: string) {
		return `SELECT *
FROM file('${path}', '${filetype}')
LIMIT 100;`;
	}

	function openNewTabIfNeeded(content: string) {
		if (currentTab.content)
			selectedTabIndex = tabs.push({ id: crypto.randomUUID(), content, name: 'Untitled' }) - 1;
		else currentTab.content = content;
	}

	let chats = $state<Chat[]>([]);
	let focusedChat = $state(0);
	$effect(() => {
		const isAIPanelOpened = isMobile ? rightDrawerOpened : rightPanel.open;
		if (isAIPanelOpened && chats.length === 0) {
			chats = [{ id: crypto.randomUUID(), messages: [], name: 'New Chat', dataset: tables.at(0) }];
		}
	});

	const saveChat = debounce(
		(chats: Chat[], active: number) => chatsRepository.save(chats, active),
		2_000
	);
	$effect(() => void saveChat($state.snapshot(chats), focusedChat).catch(console.error));
	$effect(
		() =>
			void chatsRepository.list().then(([c, active]) => {
				if (c.length) (chats = c), (focusedChat = active);
			})
	);

	const storedModel = new Persisted('ai:model', serializeModel(data.models[0]));
	const selectedModel = $derived.by(() => {
		const stored = deserializeModel(storedModel.current);
		const fallback = data.models[0];
		if (!stored) return fallback;
		return (
			data.models.find(
				(m) => m.name === stored.name && m.brand === stored.brand && m.baseURL === stored.baseURL
			) ?? fallback
		);
	});

	function handleFixQuery({ data, query }: Log) {
		focusedChat =
			chats.push({
				id: crypto.randomUUID(),
				name: 'New Chat',
				messages: [{ role: 'user', content: generateFixMessage(query, data) }]
			}) - 1;

		if (isMobile) rightDrawerOpened = true;
		else rightPanel.open = true;
	}
</script>

<svelte:window onkeydown={handleKeyDown} bind:innerWidth={screenWidth} />

{#snippet sidebar()}
	<SideBar
		{tables}
		{history}
		onHistoryOpen={handleHistoryOpen}
		onHistoryDelete={handleHistoryDelete}
		{queries}
		onQueryDelete={handleDeleteQuery}
		onQueryOpen={handleQueryOpen}
		onQueryRename={handleQueryRename}
	/>
{/snippet}

{#snippet ai()}
	<AiPanel
		bind:chats
		bind:focused={focusedChat}
		datasets={tables}
		onCloseAllTab={() => {
			if (isMobile) rightDrawerOpened = false;
			else rightPanel.open = false;
		}}
		onOpenInEditor={openNewTabIfNeeded}
		models={data.models}
		{selectedModel}
		onModelChange={(m) => (storedModel.current = serializeModel(m))}
	/>
{/snippet}

<section class="screen" class:is-mobile={isMobile}>
	<div class="workspace">
		{#if isMobile}
			<Drawer bind:open={leftDrawerOpened} width={242}>
				{@render sidebar()}
			</Drawer>
			<Drawer position="right" bind:open={rightDrawerOpened} width={300}>
				{@render ai()}
			</Drawer>
		{/if}
		<SplitPane
			type="horizontal"
			disabled={!leftPanel.open || isMobile}
			bind:pos={leftPanel.position}
			min={!leftPanel.open || isMobile ? '0px' : '242px'}
			max="40%"
		>
			{#snippet a()}
				{#if !isMobile}
					{@render sidebar()}
				{/if}
			{/snippet}
			{#snippet b()}
				<SplitPane
					type="horizontal"
					disabled={!rightPanel.open || isMobile}
					bind:pos={rightPanel.position}
					max="-300px"
					min={rightPanel.open && !isMobile ? '-48rem' : '100%'}
				>
					{#snippet a()}
						<SplitPane
							type="vertical"
							max="-20%"
							min={bottomPanel.open ? '-80%' : '100%'}
							bind:pos={bottomPanel.position}
							disabled={!bottomPanel.open}
							--color="hsl(0deg 0% 20%)"
						>
							{#snippet a()}
								<div>
									<nav class="navigation">
										<div class="tabs-container" bind:this={tabContainer}>
											{#if isMobile}
												<button class="action burger" onclick={() => (leftDrawerOpened = true)}>
													<Bars3 size="12" />
												</button>
											{/if}
											{#each tabs as tab, i}
												<TabComponent
													hide-close={tabs.length === 1}
													active={i === selectedTabIndex}
													label={tab.name}
													onClose={() => closeTab(i)}
													onSelect={() => (selectedTabIndex = i)}
												/>
											{/each}
											<button
												onclick={addNewTab}
												class="add-new"
												aria-label="Open new tab"
												title="Open new tab"
											>
												<Plus size="14" />
											</button>
										</div>
										<div class="workspace-actions">
											<button
												class="action"
												title="Copy"
												onclick={() => navigator.clipboard.writeText(currentTab.content)}
											>
												<Copy size="12" />
											</button>
											<button class="action" title="Format" onclick={handleFormat}>
												<MagicWand size="12" />
											</button>
											<button
												class="action"
												title="Save"
												onclick={handleSaveQuery}
												disabled={!canSave}
											>
												<Save size="12" />
											</button>
											{#if loading && engine.isAbortable}
												<button
													class="action"
													title="Cancel"
													onclick={() => abortController?.abort(new Error('Canceled'))}
												>
													<Stop size="11" />
												</button>
											{:else}
												<button
													class="action"
													title="Run"
													onclick={() => handleExec()}
													disabled={loading}
												>
													<Play size="12" />
												</button>
											{/if}
											<button
												class="action"
												title="Force run"
												onclick={() => handleExec(true)}
												disabled={loading}
											>
												<Bolt size="12" />
											</button>
											{#if isMobile}
												<button
													class="action"
													title="Toggle AI chat"
													onclick={() => (rightDrawerOpened = true)}
												>
													<Sparkles size="12" />
												</button>
											{/if}
										</div>
									</nav>
									{#each tabs as tab, i (tab.id)}
										<div style:display={selectedTabIndex == i ? 'block' : 'none'}>
											<Editor
												bind:value={tab.content}
												linkables={tables.map((t) => t.name)}
												onCmdClick={goToDefinition}
											/>
										</div>
									{/each}
								</div>
							{/snippet}
							{#snippet b()}
								<Result
									{response}
									logs={errors}
									bind:tab={bottomPanelTab}
									onClearLogs={() => (errors = [])}
									onClickFixWithAi={handleFixQuery}
									{warnings}
								/>
							{/snippet}
						</SplitPane>
					{/snippet}
					{#snippet b()}
						{#if !isMobile}
							{@render ai()}
						{/if}
					{/snippet}
				</SplitPane>
			{/snippet}
		</SplitPane>
	</div>
	{#if !isMobile}
		<footer>
			<button
				class:active={leftPanel.open}
				onclick={() => (leftPanel.open = !leftPanel.open)}
				style:margin-left="7px"
			>
				<PanelLeft size="12" />
			</button>
			{#if BUILD}
				<span class="label">build-{BUILD}</span>
			{/if}
			<div class="spacer"></div>
			{#if response && !loading}
				<span
					class="label"
					style:color={warnings.includes(LARGE_RESULT) ? 'hsl(0deg 100% 90%)' : ''}
				>
					{response.rows} rows
				</span>
				<span class="label">in</span>
			{/if}
			<TimeCounter bind:this={counter} />
			{#if cached}
				<span class="label">from cache</span>
			{/if}
			<button
				class:active={bottomPanel.open}
				onclick={() => (bottomPanel.open = !bottomPanel.open)}
			>
				<PanelBottom size="12" />
			</button>
			<button
				class:active={rightPanel.open}
				onclick={() => (rightPanel.open = !rightPanel.open)}
				style:margin-right="7px"
			>
				<PanelRight size="12" />
			</button>
		</footer>
	{/if}
</section>

<SaveQueryModal bind:this={saveQueryModal} onCreate={handleCreateQuery} />

<style>
	.navigation {
		height: 28px;
		display: flex;

		position: relative;

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

		& > .tabs-container {
			flex: 1;
			display: flex;
			align-items: center;
			height: 100%;
			white-space: nowrap;
			overflow-x: auto;
			overflow-y: hidden;
		}

		& > .workspace-actions {
			display: flex;
			gap: 0px;
		}

		& button.action {
			height: 100%;
			aspect-ratio: 1;
			background-color: transparent;
			border-radius: 0;
			display: flex;
			justify-content: center;
			align-items: center;

			&.burger {
				border-right: 1px solid hsl(0deg 0% 20%);
			}

			&:is(:hover, :focus-within):not(:disabled) {
				background-color: hsl(0deg 0% 10%);
			}
		}

		& ~ div {
			height: calc(100% - 28px);
		}
	}

	.add-new {
		height: calc(100% - 8px);
		aspect-ratio: 1;
		display: flex;
		place-items: center;
		justify-content: center;
		padding: 0;
		margin-left: 4px;
		border-radius: 4px;
		background-color: transparent;

		&:hover {
			cursor: pointer;
			background-color: hsl(0deg 0% 17%);
		}

		&:active {
			background-color: hsl(0deg 0% 20%);
		}
	}

	button {
		appearance: none;
		outline: none;
		border: none;
		font-size: 10px;
		font-weight: 500;

		&:is(:hover, :focus-within):not(:disabled) {
			cursor: pointer;
		}
	}

	.screen {
		height: 100%;
		width: 100%;
	}

	.workspace {
		height: calc(100% - 22px);

		& :global(svelte-split-pane-divider.disabled) {
			display: none;
		}
	}

	.is-mobile .workspace {
		height: 100%;
	}

	footer {
		height: 22px;
		width: 100%;
		border-top: 1px solid hsl(0deg 0% 20%);
		display: flex;
		place-items: center;
		gap: 4px;
		font-family: monospace;
		color: hsl(0deg 0% 70%);
		font-size: 9px;

		& > .spacer {
			flex: 1;
		}

		& > .label {
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		& > button {
			height: 100%;
			padding: 0;
			aspect-ratio: 1;
			flex-shrink: 0;
			background-color: transparent;
			color: inherit;

			&.active {
				color: hsl(204deg 88% 65%);
			}

			&:is(:hover):not(:disabled) {
				background-color: hsl(0deg 0% 10%);

				&:active {
					background-color: hsl(0deg 0% 13%);
				}
			}
		}
	}
</style>
