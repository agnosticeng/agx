export type Length = `${number}px` | `${number}%` | `${number}em` | `${number}rem`;

export function constrain(
	element: HTMLElement,
	size: number,
	min: Length,
	max: Length,
	pos: Length
): Length {
	let min_px = normalize(min, element, size);
	let max_px = normalize(max, element, size);
	let pos_px = normalize(pos, element, size);

	if (min_px < 0) min_px += size;
	if (max_px < 0) max_px += size;

	pos_px = Math.max(min_px, Math.min(max_px, pos_px));

	const position: Length = pos.endsWith('%')
		? size
			? `${(100 * pos_px) / size}%`
			: '0%'
		: `${pos_px}px`;

	return position;
}

function normalize(str: string, element: HTMLElement, size: number) {
	const num = parseFloat(str);

	if (str.endsWith('px')) {
		return num;
	}

	if (str.endsWith('%')) {
		return (size * num) / 100;
	}

	if (str.endsWith('rem')) {
		return num * parseFloat(getComputedStyle(document.documentElement).fontSize);
	}

	if (str.endsWith('em')) {
		return num * parseFloat(getComputedStyle(element).fontSize);
	}

	throw new Error(`Invalid length: ${str}`);
}
