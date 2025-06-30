import { listen } from '@tauri-apps/api/event';

export { default as SettingsModal } from './Modal.svelte';

export async function onSettingsShortcut(handler: () => void) {
	if (PLATFORM === 'WEB') {
		const listener = (e: KeyboardEvent) => {
			if (e.metaKey && e.key === ',') {
				e.preventDefault();
				handler();
			}
		};
		document.addEventListener('keydown', listener);
		return () => document.removeEventListener('keydown', listener);
	}

	if (PLATFORM === 'NATIVE') {
		const unlisten = await listen('open_settings', () => handler());
		return unlisten;
	}
}
