export default function contains(
	input: string,
	matcher: RegExp | string,
): boolean {
	if (typeof matcher === "string") {
		return input.includes(matcher)
	} else {
		return matcher.test(input)
	}
}
