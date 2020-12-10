export type Matcher = RegExp | string

export default function contains(input: string, matcher: Matcher): boolean {
	if (typeof matcher === "string") {
		return input.includes(matcher)
	} else {
		return matcher.test(input)
	}
}
