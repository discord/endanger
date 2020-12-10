import RuleFilter from "../RuleFilter"
import matches from "../utils/matches"
import Files from "../Files"
import memoizeOne from "memoize-one"

let fileMatch = memoizeOne((matchers: string[]) => {
	return danger.git.fileMatch(...matchers)
})

export default function createFilesFilter(allFiles: string[]) {
	return new RuleFilter<"files">({
		async matches(matchers) {
			let filesState = fileMatch(matchers)
			return filesState.edited || filesState.deleted
		},
		async build(matchers) {
			let filesState = fileMatch(matchers)
			let matchingFiles = matches(allFiles, matchers)
			return new Files(matchingFiles, filesState.getKeyedPaths())
		},
	})
}
