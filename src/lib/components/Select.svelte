<script lang="ts">
	import { portal } from '$lib/actions/portal.svelte';
	import { useResizeObserver } from '$lib/utilities/useResizeObserver.svelte';
	import { computePosition, flip, offset, shift, size, type Placement } from '@floating-ui/dom';
	import { type Snippet } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	interface Props {
		placement?: Placement;
		children?: Snippet;
		onClose?: () => void;
		anchor_size?: boolean;
		id?: HTMLElement['id'];
	}

	let { placement = 'bottom-start', children, onClose, anchor_size = false, id }: Props = $props();

	let opened = $state(false);
	let dropdown = $state<HTMLElement>();
	let anchor = $state.raw<HTMLElement>();

	$effect(() => void updatePosition());

	export function close() {
		opened = false;
		onClose?.();
	}

	export function open(target?: HTMLElement) {
		if (anchor !== target) anchor = target;
		opened = true;
	}

	async function updatePosition() {
		if (opened && anchor && dropdown) {
			const { x, y } = await computePosition(anchor, dropdown, {
				placement,
				middleware: [
					size({
						apply({ elements, rects }) {
							if (anchor_size)
								Object.assign(elements.floating.style, { minWidth: `${rects.reference.width}px` });
						}
					}),
					offset(5),
					flip(),
					shift({ padding: 5 })
				]
			});
			Object.assign(dropdown.style, { left: `${x}px`, top: `${y}px` });
		}
	}

	useResizeObserver(
		() => dropdown,
		() => updatePosition()
	);
</script>

<svelte:window onresize={updatePosition} onscroll={updatePosition} />

{#if opened}
	<div
		use:portal
		class="backdrop"
		transition:fade={{ duration: 150 }}
		role="presentation"
		onclick={(e) => e.target === e.currentTarget && close()}
		{id}
	>
		<div role="dialog" bind:this={dropdown} transition:fly={{ duration: 150, y: -10 }}>
			{@render children?.()}
		</div>
	</div>
{/if}

<style>
	div.backdrop {
		position: fixed;
		inset: 0;
		background-color: transparent;
		z-index: 9999;
	}

	div[role='dialog'] {
		position: absolute;
		box-shadow: 0 2px 12px 0 hsl(0deg 0% 0% / 20%);
	}
</style>
