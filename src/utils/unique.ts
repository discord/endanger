type primitive = boolean | number | bigint | string | symbol

export default function unique<T extends primitive>(array: T[]): T[] {
	return Array.from(new Set(array))
}
