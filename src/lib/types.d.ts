import type { ContextMenuState } from './components/ContextMenu';

export type AppContext = {
	contextmenu: ContextMenuState;
	isAuthenticated(): boolean;
};
