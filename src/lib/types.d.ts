import type { Sources } from './ch-engine';
import type { HistoryManager } from './components/History';
import type { Database } from './database';

type MaybePromise<T> = T | Promise<T>;

export type AppContext = {
	sources: Sources;
	database: Database;
	history: HistoryManager;
	set_query: (query: string) => void;
};
