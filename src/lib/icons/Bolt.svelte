<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	interface Props extends Omit<SvelteHTMLElements['svg'], 'width' | 'height'> {
		size?: string | number | null;
	}

	let { size = 24, ...rest }: Props = $props();
</script>

<svg viewBox="0 0 24 24" aria-hidden="true" width={size} height={size} {...rest} data-name="bold">
	<path
		fill="none"
		stroke-width="1.5"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z"
	/>
</svg>
