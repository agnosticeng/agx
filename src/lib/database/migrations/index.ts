import type { Migration } from '../Migrator.svelte';
import _001_create_initial_tables from './001_create_initial_tables.sql?raw';

/*
 * We don't use import.meta.glob here because it is not supported on cloudflare
 */
export const migrations: Migration[] = [
	{ name: 'create_initial_tables', version: 1, content: _001_create_initial_tables }
];
