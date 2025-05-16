import type { Table } from '$lib/olap-engine';
import fix_query_template from './fix_query.md?raw';
import type { ChatInput, Model } from './types';
export { OpenAIClient } from './OpenAI';
export { default as AiPanel } from './Panel.svelte';

export interface Chat {
	id: string;
	name: string;
	messages: ChatInput['messages'];
	dataset?: Table;
}

export type { Model };

export const ArgnosticModel: Model = {
	brand: 'Agnostic',
	name: 'Agnostic AI (v0)',
	baseURL: 'https://ai.agx.app/'
};

export function serializeModel(model: Model) {
	return JSON.stringify(model);
}

export function deserializeModel(model: string): Model | null {
	try {
		return JSON.parse(model);
	} catch {
		return null;
	}
}

export function generateFixMessage(sql: string, error: string) {
	return fix_query_template.replace('{{sql}}', sql).replace('{{error}}', error);
}
