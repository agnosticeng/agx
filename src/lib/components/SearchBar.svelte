<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements';
	import { MagnifyingGlass } from '$lib/icons';

	type Props = Omit<
		SvelteHTMLElements['input'],
		'type' | 'autocapitalize' | 'autocomplete' | 'autocorrect' | 'placeholder' | 'checked'
	>;

	let { value = $bindable(), ...rest }: Props = $props();
</script>

<label class="SearchBarGroup">
	<MagnifyingGlass size="12" />
	<input
		type="text"
		autocapitalize="off"
		autocomplete="off"
		autocorrect="off"
		placeholder="Search..."
		bind:value
		{...rest}
	/>
</label>

<style>
	.SearchBarGroup {
		width: 100%;
		background-color: hsl(0deg 0% 3%);
		border: 1px solid hsl(0deg 0% 3%);
		border-radius: 3px;

		display: flex;
		align-items: center;
		gap: 10px;
		padding: 5px 10px;

		& > :global(svg) {
			color: currentColor;
		}

		& > input {
			height: 100%;
		}

		&:has(> input:is(:focus-within, :hover)) {
			border-color: hsl(0deg 0% 34%);
		}
	}

	input {
		background: none;
		border: none;
		outline: none;
		caret-color: currentcolor;
	}
</style>
