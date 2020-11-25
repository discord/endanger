type primitive = boolean | number | bigint | string | symbol

export default function remove<T extends primitive>(
	array: T[],
	items: T[],
): T[] {
	let set = new Set(array)
	for (let item of items) {
		set.delete(item)
	}
	return Array.from(set)
}
