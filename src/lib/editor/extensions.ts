import { EditorState } from '@codemirror/state';
import { bracketMatching, indentUnit } from '@codemirror/language';
import { theme } from './theme';
import {
	defaultKeymap,
	history,
	historyKeymap,
	indentLess,
	insertTab,
	toggleComment
} from '@codemirror/commands';
import { keymap, lineNumbers, scrollPastEnd } from '@codemirror/view';
import { autocompletion, closeBrackets, closeBracketsKeymap } from '@codemirror/autocomplete';

export const default_extensions = [
	history(),
	lineNumbers(),
	autocompletion(),
	bracketMatching(),
	closeBrackets(),
	scrollPastEnd(),
	EditorState.tabSize.of(2),
	indentUnit.of('\t'),
	theme
];

export const default_keymaps = keymap.of([
	// Mod-Enter is reserve for query execution
	...defaultKeymap.filter((binding) => binding.key !== 'Mod-Enter'),
	// default is Mod-/ and it works fine on querty keyboard but not on azerty.
	{ key: 'Mod-Shift-/', run: toggleComment, preventDefault: true },
	...historyKeymap,
	...closeBracketsKeymap,
	{
		key: 'Tab',
		preventDefault: true,
		run: insertTab
	},
	{
		key: 'Shift-Tab',
		preventDefault: true,
		run: indentLess
	}
]);
