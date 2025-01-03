import { highlightCode } from '@lezer/highlight';
import { ProxyDialect } from './SQLDialect';
import { highlighter } from './theme';

export function generate(code: string) {
	let result = '<div class="cm-editor">';
	result += '<div class="cm-scroller">';
	result += '<div class="cm-content" style="tab-size: 2; white-space: pre-wrap;">';

	let content = '<div class="cm-line">';

	highlightCode(
		code,
		ProxyDialect.language.parser.parse(code),
		[highlighter],
		(text, classes) => {
			if (classes) {
				content += `<span class="${classes}">${text}</span>`;
			} else {
				content += text;
			}
		},
		() => {
			content += '</div><div class="cm-line">';
		}
	);

	content += '</div>'; // Close the last cm-line
	result += content;
	result += '</div>'; // Close cm-content
	result += '</div>'; // Close cm-scroller
	result += '</div>'; // Close cm-editor

	return result;
}
