import { invoke } from "@tauri-apps/api/tauri";

export async function exec(query: string): Promise<CHResponse> {
    try {
        const r: string = await invoke("query", {
            query,
            udfs: "", // @todo: add it to the config
        });
        return JSON.parse(r);
    } catch (e) {
        console.error(e);
        return undefined;
    }
}

export type CHResponse = {
    meta: Array<{ name: string; type: string }>;
    data: Array<{ [key: string]: any }>;
} | undefined
