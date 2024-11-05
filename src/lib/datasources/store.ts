import type { DataSource } from '$lib/datasources/types';
import { Store } from 'tauri-plugin-store-api';

const store = new Store('datasources.json');

const DATA_SOURCES_KEY = 'datasources';

export function getDataSources() {
	return store.get<DataSource[]>(DATA_SOURCES_KEY);
}

export async function setDataSources(ds: DataSource[] | null) {
	await store.set(DATA_SOURCES_KEY, ds);
	return await store.save();
}
