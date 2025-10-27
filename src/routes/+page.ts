import { isAuthEnabled } from '$lib/auth';
import { AgnosticModel, type Model } from '$lib/components/Ai';
import { engine } from '$lib/olap-engine';
import { getModels, isInstalled } from '$lib/ollama';
import type { PageLoad } from './$types';

export const load = (async () => {
	await engine.init();

	const isOllamaInstalled = await isInstalled();
	const models: Model[] = [];

	if (isAuthEnabled()) models.push(AgnosticModel);
	if (isOllamaInstalled) models.push(...(await getModels()));

	return { models };
}) satisfies PageLoad;
