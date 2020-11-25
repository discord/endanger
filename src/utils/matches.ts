import micromatch from "micromatch"

export default function matches(paths: string[], patterns: string[]): string[] {
	return micromatch(paths, patterns, {
		basename: true,
	})
}
