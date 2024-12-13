import { listen } from '@tauri-apps/api/event';
import { showMenu } from 'tauri-plugin-context-menu';
import type { HistorySource, QueryHistoryEntry } from './history_source.svelte';

export async function show(history: HistorySource, entry: QueryHistoryEntry) {
	const { promise, resolve } = Promise.withResolvers<void>();
	await showMenu({
		theme: 'dark',
		items: [
			{ label: 'Copy SQL', event: () => navigator.clipboard.writeText(`${entry.content}`) },
			{ is_separator: true },
			{ label: 'Remove', event: () => history.remove(entry) }
		]
	});

	const unSubscribe = await listen('menu-did-close', () => {
		resolve();
		unSubscribe();
	});

	return promise;
}
