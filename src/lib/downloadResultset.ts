import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';
import type { OLAPResponse } from './olap-engine';

export function resultsetToCSV(resultset: OLAPResponse, separator: string = ',') {
	const columns = resultset.meta.map((r) => r.name);
	return [
		columns.join(separator),
		...resultset.data.map((value) => Object.values(value).join(separator))
	].join('\n');
}

function web_download(content: string, filename: string, mimeType: string) {
	const blob = new Blob([content], { type: mimeType });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = filename;
	a.dataset.downloadurl = [mimeType, a.download, a.href].join(':');

	a.style.display = 'none';
	document.body.appendChild(a);

	a.click();

	document.body.removeChild(a);
	URL.revokeObjectURL(url);
}

async function native_download(content: string, filename: string, mimeType: string) {
	const path = await save({
		defaultPath: filename,
		title: 'Save response',
		canCreateDirectories: true
	});

	if (path) writeFile(path, new TextEncoder().encode(content));
}

export async function download(response: OLAPResponse) {
	const CSV = resultsetToCSV(response);

	if (PLATFORM === 'WEB') web_download(CSV, 'result.csv', 'text/csv');
	else await native_download(CSV, 'result.csv', 'text/csv');
}
