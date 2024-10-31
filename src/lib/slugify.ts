const SPECIAL_CHAR: Record<string, string> = {
	'%': 'percent',
	'&': 'and',
	'<': 'less',
	'>': 'greater',
	'|': 'or',
	$: 'dollar',
	'¢': 'cent',
	'£': 'pound',
	'¤': 'currency',
	'¥': 'yen',
	'€': 'euro'
};

interface SlugifyOptions {
	replacement?: string;
	trim?: boolean;
	lowerCase?: boolean;
}

const defaults = {
	replacement: '_',
	trim: true,
	lowerCase: true
};

export function slugify(str: string, opts: SlugifyOptions = {}): string {
	const options = { ...defaults, ...opts };

	let slug = str
		.normalize()
		.split('')
		.reduce((acc, char) => {
			let charToAppend = SPECIAL_CHAR[char] ?? char;

			if (char === options.replacement) {
				charToAppend = ' ';
			}

			return acc + charToAppend.replace(/[^\w\s]/g, '');
		}, '');

	if (options.trim) {
		slug = slug.trim();
	}

	slug = slug.replace(/\s+/g, options.replacement);

	if (options.lowerCase) {
		slug = slug.toLowerCase();
	}

	return slug.replace(/^(\d)/, '_$1');
}
