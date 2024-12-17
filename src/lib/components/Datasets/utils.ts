import { type Source } from '$lib/ch-engine';

export function filter(sources: Source[], search: string) {
	if (!search) return sources;
	const search_ = search.toLowerCase();

	return sources.filter(
		(s) =>
			s.name.toLowerCase().includes(search_) ||
			s.columns?.some((c) => c.name.toLowerCase().includes(search_))
	);
}

export const SOURCE_TYPE_COLOR_MAP: Record<string, string> = {
	FILE: 'hsl(58deg 37% 28%)',
	S3: 'hsl(20deg 37% 28%)',
	MergeTree: 'hsl(199deg 37% 28%)'
};

export const SOURCE_TYPE_SHORT_NAME_MAP: Record<string, string> = {
	FILE: 'FILE',
	S3: 'S3',
	MergeTree: 'MT'
};

export function remove_nullable(type: string) {
	return type.replace(/Nullable\((.*)\)/, '$1');
}
