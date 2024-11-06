import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

export const theme = syntaxHighlighting(
	HighlightStyle.define([
		{ tag: t.keyword, color: 'hsl(204, 88%, 65%)' },
		{
			tag: [t.name, t.deleted, t.character, t.propertyName, t.macroName],
			color: 'hsl(45, 7%, 75%)'
		},
		{ tag: [t.function(t.variableName), t.labelName], color: 'hsl(19, 67%, 75%)' },
		{ tag: [t.color, t.constant(t.name), t.standard(t.name)], color: 'hsl(45, 7%, 75%)' },
		{ tag: [t.definition(t.name), t.separator], color: 'hsl(45, 7%, 75%)' },
		{
			tag: [
				t.typeName,
				t.className,
				t.number,
				t.changed,
				t.annotation,
				t.modifier,
				t.self,
				t.namespace
			],
			color: 'hsl(19, 67%, 75%)'
		},
		{
			tag: [t.operator, t.operatorKeyword, t.url, t.escape, t.regexp, t.link, t.special(t.string)],
			color: 'hsl(45, 7%, 75%)'
		},
		{ tag: [t.meta, t.comment], color: 'hsl(0, 0%, 55%)' },
		{ tag: t.strong, fontWeight: 'bold' },
		{ tag: t.emphasis, fontStyle: 'italic' },
		{ tag: t.strikethrough, textDecoration: 'line-through' },
		{ tag: t.link, color: 'hsl(45, 7%, 75%)', textDecoration: 'underline' },
		{ tag: t.heading, fontWeight: 'bold', color: 'hsl(220deg 2% 90%)' },
		{ tag: [t.atom, t.bool], color: 'hsl(45, 7%, 75%)' },
		{ tag: [t.processingInstruction, t.string, t.inserted], color: 'hsl(41, 37%, 68%)' },
		{ tag: t.invalid, color: '#ff008c' }
	])
);
