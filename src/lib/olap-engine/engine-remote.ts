import { InternalEventEmitter } from './EventListener';
import type { Events, OLAPEngine, OLAPResponse, Table } from './index';

import CLICKHOUSE_GET_SCHEMA from './queries/clickhouse_get_schema.sql?raw';
import CLICKHOUSE_GET_UDFS from './queries/clickhouse_get_udfs.sql?raw';

export class RemoteEngine extends InternalEventEmitter<Events> implements OLAPEngine {
	async init() {}

	async exec(query: string, _emit = true) {
		try {
			const proxy = new URLSearchParams(window.location.search).get('proxy') ?? CLICKHOUSE_URL;
			const response = await fetch(proxy, { method: 'POST', body: query });

			const r = await response.text();
			if (!r) throw new Error(`Empty Response`);

			const data: RemoteEngineResponse = JSON.parse(r);

			if ('exception' in data) throw new Error(data.exception);

			if (_emit) this.emit('success', query, data);

			return data;
		} catch (e) {
			console.error(e);
			if (_emit) this.emit('error', e);
		}
	}

	async getSchema() {
		const response = await this.exec(CLICKHOUSE_GET_SCHEMA, false);
		if (!response) return [];
		return response.data as Table[];
	}

	async getUDFs() {
		const response = await this.exec(CLICKHOUSE_GET_UDFS, false);
		if (!response) return [];

		return response.data.map((row) => row.name as string);
	}
}

interface RemoteEngineException {
	meta: [];
	data: [];
	rows: 0;
	exception: string;
}

type RemoteEngineResponse = OLAPResponse | RemoteEngineException;
