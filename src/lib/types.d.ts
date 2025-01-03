import type { Sources } from './ch-engine';
import type { HistoryManager } from './components/History';

type MaybePromise<T> = T | Promise<T>;

export type AppContext = {
	sources: Sources;
	history: HistoryManager;
	set_query: (query: string) => void;
};
