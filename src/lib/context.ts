import { getContext, setContext } from 'svelte';
import type { ContextMenuState } from './components/ContextMenu';
import type { Runtime } from './env/runtime';

export type AppContext = {
	contextmenu: ContextMenuState;
	getRuntime: () => Runtime;
	isAuthenticated: () => boolean;
	login(): Promise<void>;
	logout(): Promise<void>;
	getToken(): Promise<string | undefined>;
};

const key = Symbol('@app/context');

export function getAppContext(): AppContext {
	return getContext(key);
}

export function setAppContext(value: AppContext) {
	setContext(key, value);
}
