import Commit from "../Commit"
import RuleFilter from "../RuleFilter"
import contains from "../utils/contains"

export default function createCommitsFilter() {
	return new RuleFilter<"commits">({
		async matches(matchers) {
			return danger.git.commits.some((commit) => {
				return matchers.some((matcher) => {
					return contains(commit.message, matcher)
				})
			})
		},
		async build(matchers) {
			return danger.git.commits
				.filter((commit) => {
					return matchers.some((matcher) => {
						return contains(commit.message, matcher)
					})
				})
				.map((commit) => {
					return new Commit(commit)
				})
		},
	})
}
