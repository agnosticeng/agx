<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	interface Props extends Omit<SvelteHTMLElements['svg'], 'width' | 'height'> {
		size?: string | number | null;
	}

	let { size = 24, ...rest }: Props = $props();
</script>

<svg viewBox="0 0 24 24" aria-hidden="true" width={size} height={size} {...rest} data-name="x-mark">
	<path
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
		stroke-linecap="round"
		stroke-linejoin="round"
		d="M6 18 18 6M6 6l12 12"
	/>
</svg>
