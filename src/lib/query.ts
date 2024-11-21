import { invoke } from '@tauri-apps/api/tauri';

export async function exec(query: string): Promise<CHResponse> {
	try {
		const r: string = await invoke('query', {
			query,
			udfs: '' // @todo: add it to the config
		});
		if (r.startsWith('Error:')) throw new Error(r);
		return JSON.parse(r);
	} catch (e) {
		console.error(e);
		return undefined;
	}
}

type SerializableType = string | boolean | number;

export type CHResponse =
	| {
			meta: Array<{ name: string; type: string }>;
			data: Array<
				Record<string, SerializableType | SerializableType[] | Record<string, SerializableType>>
			>;
			rows: number;
			statistics: { elapsed: number };
	  }
	| undefined;
