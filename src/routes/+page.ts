import type { PageLoad } from './$types';
import { getDefaultDataSources, Store } from '$lib/datasources';

export const load = (async () => {
	let datasources = await Store.getDataSources();
	if (!datasources) {
		datasources = await getDefaultDataSources();
		await Store.setDataSources(datasources);
		await Store.save();
	}

	return { datasources };
}) satisfies PageLoad;
