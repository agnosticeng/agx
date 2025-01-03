import _001_create_history_table from './001_create_history_table.sql?raw';
import type { Migration } from './manager';

export const migrations: Migration[] = [
	{ name: 'create_history_table', script: _001_create_history_table }
];

export { MigrationManager } from './manager';
