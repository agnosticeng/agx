export function uniq<T, U = T>(arr: T[], predicate: (item: T, index: number, arr: T[]) => U) {
	const set = new Set<U>();

	for (let index = 0; index < arr.length; index += 1) {
		const key = predicate(arr[index], index, arr);
		if (set.has(key)) return false;
		set.add(key);
	}

	return true;
}

export function replace<T>(arr: T[], at: number, by: T) {
	return arr
		.slice(0, at)
		.concat(by)
		.concat(arr.slice(at + 1));
}

export function remove<T>(arr: T[], at: number) {
	return arr.slice(0, at).concat(arr.slice(at + 1));
}

export function insert<T>(arr: T[], item: T, at = arr.length) {
	return arr.slice(0, at).concat(item).concat(arr.slice(at));
}
