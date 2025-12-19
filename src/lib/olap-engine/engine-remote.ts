import { InternalEventEmitter } from './EventListener';
import type { Events, ExecOptions, OLAPEngine, OLAPResponse, Table } from './index';

import CLICKHOUSE_GET_SCHEMA from './queries/clickhouse_get_schema.sql?raw';
import CLICKHOUSE_GET_UDFS from './queries/clickhouse_get_udfs.sql?raw';

const TABLE_PATTERN =
	/^(?:[a-zA-Z_][a-zA-Z0-9_]*:[a-zA-Z_][a-zA-Z0-9_]*=[a-zA-Z0-9()]+(?:,[a-zA-Z_][a-zA-Z0-9_]*=[a-zA-Z0-9()]+)*;)*[a-zA-Z_][a-zA-Z0-9_]*:[a-zA-Z_][a-zA-Z0-9_]*=[a-zA-Z0-9()]+(?:,[a-zA-Z_][a-zA-Z0-9_]*=[a-zA-Z0-9()]+)*$/;

export class RemoteEngine extends InternalEventEmitter<Events> implements OLAPEngine {
	readonly isAbortable = true;

	async init() {}

	async exec(query: string, options: ExecOptions = {}, _emit = true) {
		try {
			const proxy = new URLSearchParams(window.location.search).get('proxy') ?? CLICKHOUSE_URL;
			const response = await fetch(proxy, { method: 'POST', body: query, signal: options.signal });

			const r = await response.text();
			if (!r) throw new Error(`Empty Response`);

			const data: RemoteEngineResponse = JSON.parse(r);

			if ('exception' in data) throw new Error(data.exception);

			if (_emit) this.emit('success', query, data);

			return data;
		} catch (e) {
			console.error(e);
			if (_emit) this.emit('error', query, e);
		}
	}

	async getSchema() {
		const customs = this.getCustomSchemaFromUrl();
		const response = await this.exec(CLICKHOUSE_GET_SCHEMA, {}, false);
		if (!response) return customs;
		return customs.concat(response.data as Table[]);
	}

	async getUDFs() {
		const response = await this.exec(CLICKHOUSE_GET_UDFS, {}, false);
		if (!response) return [];

		return response.data.map((row) => row.name as string);
	}

	private getCustomSchemaFromUrl(): Table[] {
		const schemas = new URLSearchParams(window.location.search).getAll('schema');
		const replaces = new URLSearchParams(window.location.search).getAll('replace');

		if (!schemas.length || !replaces.length) return [];

		if (!schemas.every((s) => TABLE_PATTERN.test(s))) {
			console.warn('Bad schema passed');
			return [];
		}

		return schemas
			.map((raw) => {
				const [name, _columns] = raw.split(':');
				const url = replaces.find((r) => r.startsWith(`${name}:`))?.replace(`${name}:`, '') ?? '';

				if (!url) console.warn(`No URL found for ${name}: table ignored`);

				return {
					engine: 'custom',
					name,
					short: name,
					url,
					columns: _columns.split(',').map((_column) => {
						const [name, type] = _column.split('=');
						return { name, type };
					})
				};
			})
			.filter((t) => t.url);
	}
}

interface RemoteEngineException {
	meta: [];
	data: [];
	rows: 0;
	exception: string;
}

type RemoteEngineResponse = OLAPResponse | RemoteEngineException;
