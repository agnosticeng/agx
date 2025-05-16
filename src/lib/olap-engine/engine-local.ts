import { Channel, invoke } from '@tauri-apps/api/core';
import { InternalEventEmitter } from './EventListener';
import type { Events, ExecOptions, OLAPEngine, OLAPResponse, Table } from './index';

import CLICKHOUSE_GET_SCHEMA from './queries/clickhouse_get_schema.sql?raw';
import CLICKHOUSE_GET_UDFS from './queries/clickhouse_get_udfs.sql?raw';
import CLICKHOUSE_INIT_DB from './queries/clickhouse_init_db.sql?raw';

export class LocalEngine extends InternalEventEmitter<Events> implements OLAPEngine {
	readonly isAbortable = false;
	private queryQueue: Promise<any> = Promise.resolve(); // Queue for handling concurrent queries

	async init() {
		await this.exec(CLICKHOUSE_INIT_DB);
	}

	async exec(query: string, options: ExecOptions = {}, _emit = true) {
		return new Promise<OLAPResponse | undefined>((resolveOuter) => {
			this.queryQueue = this.queryQueue
				.then(() => this.executeQuery(query, _emit))
				.then((result) => {
					resolveOuter(result);
					return result;
				})
				.catch((error) => {
					resolveOuter(undefined);
					console.error('Error in query queue:', error);
					return undefined;
				});
		});
	}

	private async executeQuery(query: string, _emit: boolean): Promise<OLAPResponse | undefined> {
		let body = '';

		try {
			const result = await new Promise<Uint8Array>((resolve) => {
				let r = new Uint8Array();

				const onEvent = new Channel<Uint8Array>();

				onEvent.onmessage = (message: Uint8Array) => {
					if (message.length === 0) {
						resolve(r);
					} else {
						const newR = new Uint8Array(r.length + message.length);
						newR.set(r);
						newR.set(message, r.length);
						r = newR;
					}
				};

				invoke('query', { query: `${query};`, reader: onEvent });
			});

			if (result.length === 0) {
				if (_emit) this.emit('success', query, undefined);
				return undefined;
			}

			const decoder = new TextDecoder();
			body = decoder.decode(result);

			const data = JSON.parse(body) as OLAPResponse;

			if (_emit) this.emit('success', query, data);

			return data;
		} catch (e) {
			console.error(body);
			if (_emit) this.emit('error', query, new Error(body));
		}
	}

	async getSchema() {
		const response = await this.exec(CLICKHOUSE_GET_SCHEMA, {}, false);
		if (!response) return [];
		return response.data as Table[];
	}

	async getUDFs() {
		const response = await this.exec(CLICKHOUSE_GET_UDFS, {}, false);
		if (!response) return [];

		return response.data.map((row: any) => row.name as string);
	}
}
