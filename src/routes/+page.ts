import { isAuthEnabled } from '$lib/auth';
import { AgnosticModel, type Model } from '$lib/components/Ai';
import { engine } from '$lib/olap-engine';
import { getModels, isInstalled } from '$lib/ollama';
import type { PageLoad } from './$types';

export const load = (async ({ url }) => {
	await engine.init();

	const isOllamaInstalled = await isInstalled();
	const models: Model[] = [];

	if (isAuthEnabled()) models.push(AgnosticModel);
	if (isOllamaInstalled) models.push(...(await getModels()));

	const shareUrl = url.searchParams.get('share_url');

	return { models, shareUrl };
}) satisfies PageLoad;
