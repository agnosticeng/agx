import type { Action } from 'svelte/action';
import { on } from 'svelte/events';

export const autoresize = ((tx) => {
	function onInput() {
		tx.style.height = '0px';
		tx.style.height = `${tx.scrollHeight}px`;
	}

	onInput();
	$effect(() => on(tx, 'input', onInput));
}) satisfies Action<HTMLTextAreaElement>;
