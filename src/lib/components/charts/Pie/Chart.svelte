<script
	lang="ts"
	generics="Item, Name extends { toString(): string }, Value extends d3.NumberValue"
>
	import * as d3 from 'd3';
	import { tick } from 'svelte';

	interface Props {
		data: Item[];
		name: (d: Item) => Name;
		value: (d: Item) => Value;
		color?: (d: Item, index: number) => string;

		'name-format'?: (n: Name) => string;
		'value-format'?: (v: Value) => string;

		'name-label': string;
		'value-label': string;
	}

	let {
		data,
		name: name_accessor,
		value: value_accessor,
		color: get_color = (_, i) => `hsl(${208 + 10 * i}deg 100% 66%)`,
		'name-format': name_format = (n) => n.toString(),
		'value-format': value_format = (v) => v.toLocaleString('en-US'),
		'name-label': name_label,
		'value-label': value_label
	}: Props = $props();

	let height = $state(0);
	let width = $state(0);

	const margin = 10;

	const size = $derived(Math.min(height, width));
	const radius = $derived(size / 2);

	const N = $derived(d3.map(data, name_accessor));
	const V = $derived(d3.map(data, value_accessor));
	const I = $derived(
		d3.range(data.length).filter((i) => {
			const value = V[i];
			return !!value && !Number.isNaN(value);
		})
	);

	const arcs = $derived(
		d3
			.pie<any, number>()
			.padAngle(1 / radius)
			.sort(null)
			.value((i) => Number(V[i]))(I)
	);

	const arc = $derived(
		d3
			.arc<any, d3.PieArcDatum<number>>()
			.outerRadius(radius - margin)
			.innerRadius((radius - margin) / 3)
	);

	function set_size(node: SVGTextElement, data: d3.PieArcDatum<number>) {
		function update(d: d3.PieArcDatum<number>) {
			const angle = d.endAngle - d.startAngle;
			const degree = angle * (180 / Math.PI);

			const g = node.parentElement;
			if (g instanceof SVGGElement) {
				node.setAttribute('width', Math.round((degree * g.getBBox().width) / 360).toString());
				node.setAttribute('height', node.clientHeight.toString());
			}
		}

		update(data);

		return { update };
	}

	function wrap(node: SVGTSpanElement) {
		tick().then(() => {
			const { width } = get_size_from_parent(node);
			const text = d3.select(node);
			const chars = text.text().split('');
			const ellipsis = text.text('').append('tspan').attr('class', 'ellipsis').text('...');
			const total_chars = chars.length;
			const tspan = text.insert('tspan', ':first-child').text(chars.join(' '));

			while (tspan.node()!.getComputedTextLength() > width && chars.length) {
				chars.pop();
				tspan.text(chars.join(''));
			}

			if (chars.length === total_chars || chars.length === 0) {
				ellipsis.remove();
			}
		});
	}

	function get_size_from_parent(node: SVGTSpanElement) {
		const text = node.parentNode;
		if (!(text instanceof SVGTextElement)) return { width: 0, height: 0 };
		const width = parseFloat(text.attributes.getNamedItem('width')?.value ?? '0');
		const height = parseFloat(text.attributes.getNamedItem('height')?.value ?? '0');
		return { width, height };
	}
</script>

<div class="Container" bind:clientWidth={width} bind:clientHeight={height}>
	<svg {height} {width} viewBox={[-width / 2, -height / 2, width, height].join(' ')}>
		<g text-anchor="middle">
			{#each arcs as d}
				<path d={arc(d)} style:fill={get_color(data[d.data], d.data)} />

				{@const [x, y] = arc.centroid(d)}
				<text transform="translate({x}, {y})" use:set_size={d}>
					<tspan y="-0.4em" font-weight="600" use:wrap>
						{name_format(N[d.data])}
					</tspan>
					{#if d.endAngle - d.startAngle > 0.25}
						<tspan x="0" y="0.7em">
							{value_format(V[d.data])}
						</tspan>
					{/if}
				</text>
			{/each}
		</g>
	</svg>
</div>

<style>
	div.Container {
		position: relative;
		height: 100%;
		width: 100%;
		display: flex;
		justify-content: center;
		overflow: hidden;
	}

	svg {
		height: 100%;
		width: 100%;
	}
</style>
