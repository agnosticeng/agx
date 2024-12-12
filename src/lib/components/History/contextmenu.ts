import type { History, HistoryEntry } from '$lib/history.svelte';
import { listen } from '@tauri-apps/api/event';
import { showMenu } from 'tauri-plugin-context-menu';

export async function show<T>(history: History<T>, entry: HistoryEntry<T>) {
	const { promise, resolve } = Promise.withResolvers<void>();
	await showMenu({
		theme: 'dark',
		items: [
			{ label: 'Copy SQL', event: () => navigator.clipboard.writeText(`${entry.state}`) },
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
