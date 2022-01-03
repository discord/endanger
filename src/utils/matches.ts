import path from "path"
import micromatch from "micromatch"

export default function matches(paths: string[], patterns: string[]): string[] {
	const isBasename = patterns.every((pattern) => path.basename(pattern) === pattern)
	return micromatch(paths, patterns, {
		basename: isBasename,
	})
}
