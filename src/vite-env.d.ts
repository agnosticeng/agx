declare const PLATFORM: 'NATIVE' | 'WEB';
declare const BUILD: string;
declare const CLICKHOUSE_URL: string;
declare const OLLAMA_BASE_URL: string;

declare const AUTH0_DOMAIN: string;
declare const AUTH0_CLIENT_ID: string;
declare const AUTH0_REDIRECT_URI: string;

type MaybePromise<T> = T | Promise<T>;
