import { openUrl as openUrlWithBrowser } from '@tauri-apps/plugin-opener';
import { detectRuntime } from './runtime';

export async function openUrl(url: string) {
	const runtime = detectRuntime();
	if (runtime === 'desktop') await openUrlWithBrowser(url);
	else window.location.assign(url);
}
