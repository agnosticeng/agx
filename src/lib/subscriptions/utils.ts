import { onOpenUrl } from '@tauri-apps/plugin-deep-link';
import mitt from 'mitt';
import type { Subscription } from './client';

export function isSubscriptionActive(sub?: Subscription | null) {
	if (!sub) return false;
	return !sub.endAt || sub.endAt.getTime() < Date.now();
}

const emitter = mitt<{ 'billing:change': void }>();

export function onSubscriptionChange(cb: () => void) {
	emitter.on('billing:change', cb);
	return () => emitter.off('billing:change', cb);
}

export function refresh() {
	emitter.emit('billing:change');
}

export async function handleSubscriptionRedirect() {
	if (PLATFORM === 'WEB') {
		if (window.location.search.includes('sessionId=')) {
			window.history.replaceState({}, document.title, '/');
		}
		emitter.emit('billing:change');
	}

	if (PLATFORM === 'NATIVE') {
		await onOpenUrl(async (urls) => {
			const url = urls.map((u) => new URL(u)).find((u) => u.pathname === '/billing');

			if (url) emitter.emit('billing:change');
		});
	}
}
