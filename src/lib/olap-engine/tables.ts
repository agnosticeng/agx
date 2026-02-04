interface Source {
	slug: string;
	path: string;
}

const SQL_KEYWORDS = new Set([
	'WHERE',
	'ON',
	'GROUP',
	'ORDER',
	'LIMIT',
	'OFFSET',
	'HAVING',
	'SET',
	'LEFT',
	'RIGHT',
	'INNER',
	'OUTER',
	'CROSS',
	'JOIN',
	'UNION',
	'RETURNING',
	'VALUES',
	';'
]);

export function applyCustomTable(query: string, sources: Source[]) {
	let newQuery = query;

	for (const { slug, path } of sources) {
		const regex = new RegExp(
			`(\\bFROM\\b|\\bJOIN\\b|\\bUPDATE\\b|\\bINTO\\b)\\s+(?:(\\w+)\\.)?(${slug})\\b(\\s+(?:AS\\s+)?\\w+)?`,
			'gi'
		);

		newQuery = newQuery.replace(
			regex,
			(_fullMatch, keyword, _schema, foundTable, potentialAliasChunk) => {
				let finalAliasPart = '';

				if (potentialAliasChunk) {
					const rawAlias = potentialAliasChunk.trim().replace(/^AS\s+/i, '');
					if (SQL_KEYWORDS.has(rawAlias.toUpperCase())) {
						finalAliasPart = ` ${foundTable} ${potentialAliasChunk}`;
					} else {
						finalAliasPart = potentialAliasChunk;
					}
				} else {
					finalAliasPart = ` ${foundTable}`;
				}
				return `${keyword} ${path}${finalAliasPart}`;
			}
		);

		newQuery = newQuery.replace(
			new RegExp(`(DESCRIBE)\\s+(?:TABLE\\s+)?(${slug})\\b`, 'gi'),
			`$1 ${path}`
		);
	}

	return newQuery;
}
