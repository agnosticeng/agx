import type { Table } from '$lib/olap-engine';
import mitt from 'mitt';

type Events = {
	expand: Table['name'];
	'expand-all': void;
	'collapse-all': void;
};

const emitter = mitt<Events>();

export function goToDefinition(tableName: string) {
	emitter.emit('expand', tableName);
}

export function onExpand(handler: (tableName: string) => void) {
	emitter.on('expand', handler);

	return () => emitter.off('expand', handler);
}

export function expandAll() {
	emitter.emit('expand-all');
}

export function onExpandAll(handler: () => void) {
	emitter.on('expand-all', handler);

	return () => emitter.off('expand-all', handler);
}

export function collapseAll() {
	emitter.emit('collapse-all');
}

export function onCollapseAll(handler: () => void) {
	emitter.on('collapse-all', handler);

	return () => emitter.off('collapse-all', handler);
}
