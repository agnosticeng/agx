import { init } from '$lib/ch-engine';
import { migrations } from '$lib/database/migrations';
import type { PageLoad } from './$types';

export const load = (async () => {
	await init();

	return { migrations };
}) satisfies PageLoad;
