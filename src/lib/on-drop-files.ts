import { webview } from '@tauri-apps/api';

const ALLOWED_TYPES = ['csv', 'parquet'];

export function onDropFiles(hander: (paths: string[]) => void) {
	if (PLATFORM === 'WEB') return;

	return webview.getCurrentWebview().onDragDropEvent(({ payload }) => {
		if (payload.type === 'drop') hander(payload.paths.filter(isAllowed));
	});
}

function isAllowed(path: string) {
	const ext = path.split('.').pop();
	return ext && ALLOWED_TYPES.includes(ext.toLowerCase());
}

export function fileQuery(path: string) {
	const extension = extractType(path.split('.').pop()!)!;

	return `SELECT *
FROM file('${path}', '${extension}')
LIMIT 100;`;
}

function extractType(extension: string): 'CSV' | 'Parquet' | undefined {
	switch (extension.toLowerCase()) {
		case 'csv':
			return 'CSV';
		case 'parquet':
			return 'Parquet';
	}
}
