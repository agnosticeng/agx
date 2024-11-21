export function resolve_type(_type: string) {
	const type = normalize_type(_type);
	if (/^Array/.test(type)) return 'array';
	if (/^DateTime/.test(type)) return 'date';
	if (/U?Int[0-9]+/.test(type)) return 'integer';
	if (/Float/.test(type)) return 'number';
	if (/Decimal/.test(type)) return 'number';
	if (type === 'Bool') return 'boolean';
	if (/String/.test(type)) return 'string';
	return 'unknown';
}

function normalize_type(type: string) {
	return type.replace(/Nullable\((.*)\)/, '$1').replace(/\(\d+(, (.*))?\)/, '');
}

/**
select
	date_trunc('day', timestamp) as unix_time,
	count(*) as event_count
from
	agnostic_logs
where
	timestamp >= now() - interval 2 month
group by unix_time
order by unix_time asc
 */
