import type { Length } from '@rich_harris/svelte-split-pane';
import { Persisted } from './Persisted.svelte';
import { untrack } from 'svelte';

export class PanelState {
	#position: Persisted<Length>;
	#open: Persisted<'true' | 'false'>;

	constructor(key: string, position: Length, open = true) {
		this.#position = new Persisted(`${key}:position`, position);
		this.#open = new Persisted(`${key}:open`, open ? 'true' : 'false');
	}

	get open() {
		return this.#open.current === 'true';
	}

	set open(open: boolean) {
		untrack(() => (this.#open.current = open ? 'true' : 'false'));
	}

	get position() {
		if (this.open) return this.#position.current;
		return '0px';
	}

	set position(position: Length) {
		if (this.open) this.#position.current = position;
	}
}
