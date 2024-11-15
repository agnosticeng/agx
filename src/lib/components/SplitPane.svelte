<script lang="ts">
	import type { Snippet } from 'svelte';
	import { type Length, constrain } from './utils';
	interface Props {
		id?: string;
		orientation: 'horizontal' | 'vertical';
		position?: Length;
		min?: Length;
		max?: Length;
		disabled?: boolean;
		a: Snippet;
		b: Snippet;
	}

	let {
		id,
		orientation,
		position: pos = '50%',
		disabled = false,
		min = '0%',
		max = '100%',
		a,
		b
	}: Props = $props();

	let container: HTMLElement;

	let dragging = $state(false);
	let width = $state(0);
	let height = $state(0);

	let position = $state(pos);

	$effect(() => {
		if (container) {
			const size = orientation === 'horizontal' ? width : height;
			position = constrain(container, size, min, max, position);
		}
	});

	function update(x: number, y: number) {
		if (disabled) return;

		const { top, left } = container.getBoundingClientRect();

		const pos_px = orientation === 'horizontal' ? x - left : y - top;
		const size = orientation === 'horizontal' ? width : height;

		position = pos.endsWith('%') ? `${(100 * pos_px) / size}%` : `${pos_px}px`;
	}

	function drag(node: HTMLElement, callback: (event: PointerEvent) => void) {
		const pointerdown = (event: PointerEvent) => {
			if (
				(event.pointerType === 'mouse' && event.button === 2) ||
				(event.pointerType !== 'mouse' && !event.isPrimary)
			)
				return;

			node.setPointerCapture(event.pointerId);

			event.preventDefault();

			dragging = true;

			const onpointerup = () => {
				dragging = false;

				node.setPointerCapture(event.pointerId);

				window.removeEventListener('pointermove', callback, false);
				window.removeEventListener('pointerup', onpointerup, false);
			};

			window.addEventListener('pointermove', callback, false);
			window.addEventListener('pointerup', onpointerup, false);
		};

		node.addEventListener('pointerdown', pointerdown, { capture: true, passive: false });

		return {
			destroy() {
				node.removeEventListener('pointerdown', pointerdown);
			}
		};
	}
</script>

<!-- 
 @component
 @description heavily inspired by `@rich_harris/svelte-split-pane` package. Basically just a migration to svelte5, drop the component and use the library once Rich updates it
 -->

<div
	data-pane={id}
	class="container {orientation}"
	bind:this={container}
	bind:clientWidth={width}
	bind:clientHeight={height}
	style="--pos: {position}"
>
	<div class="pane">
		{@render a()}
	</div>

	<div class="pane">
		{@render b()}
	</div>

	{#if pos !== '0%' && pos !== '100%'}
		<div
			class="{orientation} divider"
			class:disabled
			use:drag={(e) => update(e.clientX, e.clientY)}
		></div>
	{/if}
</div>

{#if dragging}
	<div class="mousecatcher"></div>
{/if}

<style>
	.container {
		--sp-thickness: var(--thickness, 8px);
		--sp-color: var(--color, transparent);
		display: grid;
		position: relative;
		width: 100%;
		height: 100%;
	}

	.container.vertical {
		grid-template-rows: var(--pos) 1fr;
	}

	.container.horizontal {
		grid-template-columns: var(--pos) 1fr;
	}

	.pane {
		width: 100%;
		height: 100%;
		overflow: auto;
	}

	.pane > :global(*) {
		width: 100%;
		height: 100%;
		overflow: hidden;
	}

	.mousecatcher {
		position: absolute;
		left: 0;
		top: 0;
		width: 100%;
		height: 100%;
		background: rgba(255, 255, 255, 0.0001);
	}

	.horizontal + .mousecatcher {
		cursor: ew-resize;
	}

	.vertical + .mousecatcher {
		cursor: ns-resize;
	}

	.divider {
		position: absolute;
		touch-action: none !important;
	}

	.divider::after {
		content: '';
		position: absolute;
		background-color: var(--sp-color);
	}

	.horizontal > .divider {
		padding: 0 calc(0.5 * var(--sp-thickness));
		width: 0;
		height: 100%;
		cursor: ew-resize;
		left: var(--pos);
		transform: translate(calc(-0.5 * var(--sp-thickness)), 0);
	}

	.horizontal > .divider.disabled {
		cursor: default;
	}

	.horizontal > .divider::after {
		left: 50%;
		top: 0;
		width: 1px;
		height: 100%;
	}

	.vertical > .divider {
		padding: calc(0.5 * var(--sp-thickness)) 0;
		width: 100%;
		height: 0;
		cursor: ns-resize;
		top: var(--pos);
		transform: translate(0, calc(-0.5 * var(--sp-thickness)));
	}

	.vertical > .divider.disabled {
		cursor: default;
	}

	.vertical > .divider::after {
		top: 50%;
		left: 0;
		width: 100%;
		height: 1px;
	}
</style>
