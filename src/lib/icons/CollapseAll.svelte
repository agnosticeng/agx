<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	interface Props extends Omit<SvelteHTMLElements['svg'], 'width' | 'height' | 'fill'> {
		size?: string | number | null;
	}

	let { size = 24, color = 'currentColor', ...rest }: Props = $props();
</script>

<svg width={size} height={size} viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" fill={color}>
	<path d="M9 9H4v1h5V9z" />
	<path
		fill-rule="evenodd"
		clip-rule="evenodd"
		d="M5 3l1-1h7l1 1v7l-1 1h-2v2l-1 1H3l-1-1V6l1-1h2V3zm1 2h4l1 1v4h2V3H6v2zm4 1H3v7h7V6z"
	/>
</svg>
