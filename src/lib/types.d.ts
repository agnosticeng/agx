import type { ContextMenuState } from './components/ContextMenu';
import type { Subscription } from './subscriptions';

export type AppContext = {
	contextmenu: ContextMenuState;
	isAuthenticated(): boolean;
	subscription(): Subscription | null;
};
