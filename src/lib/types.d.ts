import type { Sources } from './ch-engine';
import type { QueryHistory } from './components/History';

type MaybePromise<T> = T | Promise<T>;

export type AppContext = {
	sources: Sources;
	history: QueryHistory;
};
