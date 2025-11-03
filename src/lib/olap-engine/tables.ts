import type { Table } from '.';

interface Source {
	slug: string;
	path: string;
}

export function applySlugs(query: string, sources: Source[]) {
	for (const source of sources) {
		query = query.replace(new RegExp(`(from|FROM)[ \n\t]+(${source.slug})`, 'g'), (match) =>
			match.replace(source.slug, `${source.path} ${source.slug}`)
		);

		query = query.replace(
			new RegExp(`(describe|DESCRIBE)([ \n\t]+(table|TABLE))?[ \n\t]+(${source.slug})`, 'g'),
			(match) => match.replace(source.slug, `${source.path}`)
		);
	}

	return query;
}

const TABLE_PATTERN =
	/^(?:[a-zA-Z_]+:[a-zA-Z_]+=[a-zA-Z()0-9]+(?:,[a-zA-Z_]+=[a-zA-Z()0-9]+)*;)*[a-zA-Z_]+:[a-zA-Z_]+=[a-zA-Z()0-9]+(?:,[a-zA-Z_]+=[a-zA-Z()0-9]+)*$/;

export function getCustomSchemaFromUrl(): Table[] {
	const schema = new URLSearchParams(window.location.search).get('schema');
	const replaces = new URLSearchParams(window.location.search).getAll('replace');

	if (!schema || !replaces) return [];

	if (!TABLE_PATTERN.test(schema)) {
		console.warn('Bad schema passed');
		return [];
	}

	return schema
		.split(';')
		.map((raw) => {
			const [name, _columns] = raw.split(':');
			const url = replaces.find((r) => r.startsWith(`${name}:`))?.replace(`${name}:`, '') ?? '';

			if (!url) console.warn(`No URL found for ${name}: table ignored`);

			return {
				engine: 'custom',
				name,
				short: name,
				url,
				columns: _columns.split(',').map((_column) => {
					const [name, type] = _column.split('=');
					return { name, type };
				})
			};
		})
		.filter((t) => t.url);
}
