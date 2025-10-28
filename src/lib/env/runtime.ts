export function detectRuntime() {
	if (PLATFORM === 'NATIVE') return 'desktop';
	if (window.self !== window.top) return 'embedded';
	return 'web';
}

export type Runtime = 'desktop' | 'embedded' | 'web';
