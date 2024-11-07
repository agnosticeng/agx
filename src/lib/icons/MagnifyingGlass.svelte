<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	type Props = Omit<SvelteHTMLElements['svg'], 'width' | 'height'> & {
		size?: string | number | null;
	};

	let { size = 24, ...rest }: Props = $props();
</script>

<svg
	fill="none"
	viewBox="0 0 24 24"
	stroke-width="1.5"
	stroke="currentColor"
	aria-hidden="true"
	width={size}
	height={size}
	{...rest}
	data-name="magnifying-glass"
>
	<path
		stroke-linecap="round"
		stroke-linejoin="round"
		d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
	/>
</svg>
