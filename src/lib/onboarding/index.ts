import type { Tab } from '$lib/repositories/tabs';
import GAS_PRICE from './gas_price.sql?raw';
import TOKEN_PRICE from './token_price.sql?raw';

const KEY = 'onboarding';

export function onboarding(): Tab[] {
	if (typeof window === 'undefined') return [];
	const needed =
		Boolean(localStorage.getItem(KEY)) ||
		location.host === 'agx.app' ||
		location.host.endsWith('.agx-80h.pages.dev');

	if (needed) {
		localStorage.setItem(KEY, Date.now().toString());
		return [
			{ id: crypto.randomUUID(), content: GAS_PRICE, name: 'Gas Price (Example)' },
			{ id: crypto.randomUUID(), content: TOKEN_PRICE, name: 'Token Price (Example)' }
		];
	}

	return [];
}
