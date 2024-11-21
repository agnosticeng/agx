<script lang="ts" module>
	const authorized_types = ['number', 'integer', 'date'];
	type ValidType = 'number' | 'integer' | 'date';

	export function isValidType(type: string): type is ValidType {
		return authorized_types.includes(type);
	}

	export function applyType(value: unknown, type: ValidType) {
		if (type === 'date') return new Date(value as string);
		return Number(value);
	}
</script>

<script lang="ts" generics="Item">
	import * as d3 from 'd3';
	import { sineOut } from 'svelte/easing';
	import { tweened } from 'svelte/motion';
	import { fade } from 'svelte/transition';
	import { line_chart, line_generator } from './graph';

	interface Props {
		color?: string;

		/* eslint-disable no-undef */
		data: Array<Item>;
		x_accessor: (item: Item) => d3.NumberValue;
		y_accessor: (item: Item) => d3.NumberValue;
		/* eslint-enable no-undef */

		x_format: (x: d3.NumberValue) => string;
		y_format: (y: d3.NumberValue) => string;

		x_label: string;
		y_label: string;
	}

	let {
		color = 'hsl(208deg 100% 66%)',
		data,
		x_accessor,
		y_accessor,
		x_format,
		y_format,
		x_label,
		y_label
	}: Props = $props();

	const { scales, coords } = $derived(line_chart(data, { x_accessor, y_accessor }));
	const ticks = $derived(scales.y.ticks(7));

	const cursor = tweened<number | undefined>(undefined, { easing: sineOut });

	function handleMouseMove(e: PointerEvent) {
		const [pointer_x] = d3.pointer(e);
		cursor.set(scales.x.invert(pointer_x));
	}

	let tooltip_element = $state<HTMLElement>();
	$effect(() => {
		return cursor.subscribe((value) => {
			if (value && tooltip_element) {
				const max_width = tooltip_element.parentElement!.clientWidth;
				const rect = tooltip_element.getBoundingClientRect();
				const x = max_width * (scales.x(value) / 100);
				tooltip_element.style.setProperty('--width', `${rect.width}px`);
				tooltip_element.classList.toggle('Revert', max_width < x + rect.width);
			}
		});
	});
</script>

<div class="Container">
	<div class="Axis">
		{#each ticks as tick (tick)}
			<div class="Tick" style:top="{scales.y(tick)}%">
				<span>{tick.toLocaleString('en')}</span>
				<div class="Line"></div>
			</div>
		{/each}
	</div>
	<svg viewBox="0 0 100 100" preserveAspectRatio="none" onpointermove={handleMouseMove}>
		<g stroke-width="2" fill="transparent">
			<path d={line_generator(coords)} stroke={color} />
		</g>
		{#if $cursor}
			<line
				x1={scales.x($cursor)}
				x2={scales.x($cursor)}
				y1="0"
				y2="100"
				stroke="var(--line-color)"
				stroke-width="3"
			/>
		{/if}
	</svg>
	<div class="Cursors">
		{#if $cursor}
			{@const y_value = scales.x_to_y($cursor)}
			{@const y_ = scales.y(y_value)}
			{@const x_ = scales.x($cursor)}
			<span class="circle" style:left="{x_}%" style:top="{y_}%">
				<span style:background-color={color}></span>
			</span>

			<section
				bind:this={tooltip_element}
				in:fade={{ duration: 150 }}
				class="Tooltip"
				style:--left="{x_}%"
				style:--top="{y_}%"
			>
				<h4>
					<span>{x_label}: </span>
					<span>{x_format($cursor)}</span>
				</h4>
				<article>
					<span>{y_label}: </span>
					<span>{y_format(y_value)}</span>
				</article>
			</section>
		{/if}
	</div>
</div>

<style>
	div.Container {
		--line-color: hsl(0deg 0% 59%);
		--left-space: 62px;

		position: relative;
		height: 100%;
		width: 100%;

		padding-left: var(--left-space);
	}

	.Axis {
		position: absolute;
		z-index: 0;
		inset: 0;

		& > .Tick {
			position: absolute;
			left: 0;
			right: 0;
			transform: translate(0, -50%);

			display: flex;
			align-items: center;
			gap: 8px;

			& > span {
				color: hsl(0deg 0% 71%);
			}

			& > .Line {
				flex: 1;
				height: 1px;
				background: var(--line-color);
			}
		}
	}

	.Cursors {
		position: absolute;
		z-index: 1;
		top: 0;
		width: calc(100% - var(--left-space));
		height: 100%;
		pointer-events: none;

		& > .circle {
			transform-origin: center;
			position: absolute;
			transform: translate(-50%, -50%);
			border-radius: 50%;
			aspect-ratio: 1 / 1;
			width: 15px;
			background-color: hsl(0deg 0% 17%);
			border: 1px solid hsl(0deg 0% 17%);
			padding: 3px;

			display: grid;
			place-items: center;

			& > span {
				height: 100%;
				width: 100%;
				border-radius: 50%;
			}
		}

		& > .Tooltip {
			display: flex;
			flex-direction: column;
			gap: 4px;
			user-select: none;
			-webkit-user-select: none;
			position: absolute;
			top: 50%;
			left: var(--left);
			top: var(--top);
			transform: translate(13px, -50%);
			border: 1px solid hsl(0deg 0% 29%);
			border-radius: 12px;
			background-color: hsl(0deg 0% 0%);
			padding: 8px 12px;
			pointer-events: none;
			z-index: 2;

			&:global(.Revert) {
				left: calc(var(--left) - var(--width));
				transform: translate(-13px, -50%);
			}

			& > h4 {
				margin: 0;
				font-size: 1rem;
				line-height: 0.75rem;
				font-weight: 500;
			}

			& > article {
				display: flex;
				align-items: center;
				justify-content: space-between;
				gap: 20px;
				text-wrap: nowrap;

				& > span:first-of-type {
					color: hsl(0deg 0% 71%);
				}
			}
		}
	}

	svg {
		position: relative;
		z-index: 1;

		height: 100%;
		width: 100%;

		overflow: visible;
	}

	svg :global(*) {
		vector-effect: non-scaling-stroke;
	}
</style>
