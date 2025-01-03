export function handleKeydown(
	e: KeyboardEvent & { currentTarget: EventTarget & HTMLOListElement }
) {
	if (!(e.target instanceof HTMLElement)) return;
	const host = e.currentTarget;
	const fucusable_elements = Array.from<HTMLElement>(
		host.querySelectorAll('[tabindex]:is(summary, li)')
	);

	const index = fucusable_elements.indexOf(e.target);

	if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
		e.preventDefault();

		const direction = e.key === 'ArrowDown' ? 1 : -1;
		const length = fucusable_elements.length;
		const nextIndex = (length + index + direction) % length;

		let next = fucusable_elements[nextIndex];

		if (!is_visible(next)) {
			if (direction === -1)
				next =
					fucusable_elements
						.slice(0, nextIndex)
						.findLast((el) => el.tagName.toLowerCase() === 'summary') ??
					fucusable_elements[fucusable_elements.length - 1];
			else if (direction === 1)
				next =
					fucusable_elements
						.slice(nextIndex + 1)
						.find((el) => el.tagName.toLowerCase() === 'summary') ?? fucusable_elements[0];
		}

		fucusable_elements.forEach((e) => (e.tabIndex = -1));

		next.tabIndex = 0;
		next.focus();
		return;
	}

	if (['ArrowLeft', 'ArrowRight'].includes(e.key)) {
		const details = get_nearest_parent(e.target, 'details');
		if (details instanceof HTMLDetailsElement) {
			if (e.target.tagName.toLowerCase() === 'summary') {
				e.preventDefault();
				details.open = e.key === 'ArrowRight';
				return;
			}

			if (details.open && e.key === 'ArrowLeft') {
				const next = fucusable_elements
					.slice(0, index)
					.findLast((el) => el.tagName.toLowerCase() === 'summary');

				if (next) {
					fucusable_elements.forEach((e) => (e.tabIndex = -1));

					next.tabIndex = 0;
					next.focus();
					return;
				}
			}
		}
	}
}

function is_visible(el: HTMLElement) {
	if (el.tagName.toLowerCase() === 'summary') return true;

	const details = get_nearest_parent(el, 'details') as HTMLDetailsElement | null;
	if (details?.open) return true;

	return false;
}

function get_nearest_parent(el: HTMLElement, withTagName: string) {
	let parent = el.parentElement;

	while (parent && parent.tagName.toLowerCase() !== withTagName.toLowerCase()) {
		parent = parent.parentElement;
	}

	return parent;
}
