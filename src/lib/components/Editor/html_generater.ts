import { highlightCode } from '@lezer/highlight';
import { ProxyDialect } from './SQLDialect';
import { highlighter } from './theme';

export function generate(code: string) {
	const result = document.createElement('div');
	result.classList.add('cm-editor');

	const scroller = document.createElement('div');
	scroller.classList.add('cm-scroller');

	result.appendChild(scroller);

	const content = document.createElement('div');
	content.classList.add('cm-content');
	content.style.tabSize = '2';
	content.style.whiteSpace = 'pre';

	scroller.appendChild(content);

	const line = document.createElement('div');
	line.classList.add('cm-line');

	content.appendChild(line);

	highlightCode(
		code,
		ProxyDialect.language.parser.parse(code),
		[highlighter],
		(text, classes) => {
			let node: Text | HTMLElement = document.createTextNode(text);
			if (classes) {
				let span = document.createElement('span');
				span.appendChild(node);
				span.className = classes;
				node = span;
			}
			content.lastElementChild?.appendChild(node);
		},
		() => {
			const next = document.createElement('div');
			next.classList.add('cm-line');
			content.appendChild(next);
		}
	);

	return result.outerHTML;
}
