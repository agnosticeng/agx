import type { Migration } from '$lib/migrate';
import _001_create_history_table from './001_create_history_table.sql?raw';

export const migrations: Migration[] = [
	{ name: 'create_history_table', script: _001_create_history_table }
];
