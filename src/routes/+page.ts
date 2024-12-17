import { init } from '$lib/ch-engine';
import type { PageLoad } from './$types';

export const load = (async () => {
	await init();

	return {};
}) satisfies PageLoad;
