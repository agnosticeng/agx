import hljs from 'highlight.js';
import { Marked } from 'marked';
import { markedHighlight } from 'marked-highlight';
import './markdown.css';

export function transform(content: string) {
	const marked = new Marked(
		markedHighlight({
			langPrefix: 'hljs language-',
			highlight(code, lang, _info) {
				const language = hljs.getLanguage(lang) ? lang : 'text';
				return hljs.highlight(code, { language }).value;
			}
		})
	);

	return marked.parse(content, { async: false });
}
