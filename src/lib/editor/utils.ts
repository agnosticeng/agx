import type { DataSource } from '$lib/datasources';
import type { Completion } from '@codemirror/autocomplete';

export function datasourceToCodeMirrorSQLSchema(sources: DataSource[]) {
	const completions: { [table: string]: readonly Completion[] } = {};

	for (const source of sources) {
		if (source.describe) {
			completions[source.slug] = source.describe.data.map((column) => ({
				label: column.name as string,
				type: 'property'
			}));
		}
	}

	return completions;
}

export function applySlugs(query: string, sources: DataSource[]) {
	let q = query;

	for (const source of sources) {
		q = q.replace(new RegExp(`(from|FROM)[ \n\t]+(${source.slug})`, 'g'), (match) =>
			match.replace(source.slug, `${source.path} ${source.slug}`)
		);

		q = q.replace(
			new RegExp(`(describe|DESCRIBE)([ \n\t]+(table|TABLE))?[ \n\t]+(${source.slug})`, 'g'),
			(match) => match.replace(source.slug, `${source.path}`)
		);
	}

	return q;
}
