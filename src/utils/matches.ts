import path from "path"
import micromatch from "micromatch"

export default function matches(paths: string[], patterns: string[]): string[] {
	// https://github.com/micromatch/micromatch/#options implies that `basename` only applies to patterns without slashes
	// However, that doesn't seem to be the case in practice; this means that files.matches does not match when
	//     path=some_directory/File.tsx
	//     pattern=some_directory/**/*
	// We ignore patterns with subdirectories for now, pending resolution of https://github.com/micromatch/picomatch/issues/89
	const isBasename = patterns.every((pattern) => path.basename(pattern) === pattern)
	return micromatch(paths, patterns, {
		basename: isBasename,
	})
}
