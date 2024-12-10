import type { Range } from '$lib/components/charts/types';

export const relative_x_range = [0, 100] as Range;
export const relative_y_range = [100, 0] as Range;

export function getTextWidth(text: string) {
	let width = 0;
	const div = document.createElement('div');
	div.innerText = text;
	div.style.position = 'absolute';
	div.style.float = 'left';
	div.style.whiteSpace = 'nowrap';
	div.style.visibility = 'hidden';
	document.body.appendChild(div);
	width = div.clientWidth;
	div.remove();

	return width;
}

export function getRelativeParent<E extends Element>(node: E) {
	let parent = node.parentElement;

	while (parent && getComputedStyle(parent).position !== 'relative') {
		parent = parent.parentElement;
	}

	return parent;
}

export function clamp(value: number, min: number, max: number) {
	return Math.min(max, Math.max(value, min));
}
