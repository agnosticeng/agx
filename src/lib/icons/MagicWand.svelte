<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';

	interface Props extends Omit<SvelteHTMLElements['svg'], 'width' | 'height'> {
		size?: string | number | null;
	}

	let { size = 24, ...rest }: Props = $props();
</script>

<svg viewBox="0 0 256 256" width={size} height={size} {...rest} data-name="magic-wand">
	<line
		x1="216"
		y1="128"
		x2="216"
		y2="176"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="16"
	/>
	<line
		x1="192"
		y1="152"
		x2="240"
		y2="152"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="16"
	/>
	<line
		x1="80"
		y1="40"
		x2="80"
		y2="88"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="16"
	/>
	<line
		x1="56"
		y1="64"
		x2="104"
		y2="64"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="16"
	/>
	<line
		x1="168"
		y1="184"
		x2="168"
		y2="216"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="16"
	/>
	<line
		x1="152"
		y1="200"
		x2="184"
		y2="200"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="16"
	/>
	<line
		x1="144"
		y1="80"
		x2="176"
		y2="112"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="16"
	/>
	<rect
		x="21.49"
		y="105.37"
		width="213.02"
		height="45.25"
		rx="8"
		transform="translate(-53.02 128) rotate(-45)"
		fill="none"
		stroke="currentColor"
		stroke-linecap="round"
		stroke-linejoin="round"
		stroke-width="16"
	/>
</svg>
