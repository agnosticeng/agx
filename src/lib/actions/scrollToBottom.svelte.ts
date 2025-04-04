import { tick } from 'svelte';
import type { Action } from 'svelte/action';

export const scroll_to_bottom = ((node) => {
	const observer = new MutationObserver((mutations) => {
		for (const mutation of mutations) {
			if (mutation.type === 'childList') {
				tick().then(() => node.scroll({ top: node.scrollHeight, behavior: 'smooth' }));
			}
		}
	});

	$effect(() => {
		observer.observe(node, { childList: true });
		return () => observer.disconnect();
	});
}) satisfies Action;
