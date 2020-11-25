export default class ArrayMap<K, V> extends Map<K, V[]> {
	append(key: K, value: V) {
		let prev: V[]

		if (!this.has(key)) {
			prev = []
			this.set(key, prev)
		} else {
			prev = this.get(key)!
		}

		prev.push(value)
	}
}
