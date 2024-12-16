import { invoke } from '@tauri-apps/api/tauri';

export async function exec(query: string) {
	try {
		const r: string = await invoke('query', {
			query
		});
		return JSON.parse(r) as CHResponse;
	} catch (e) {
		console.error(e);
	}
}

export type CHResponse = {
	meta: Array<{ name: string; type: string }>;
	data: Array<{ [key: string]: any }>;
};
