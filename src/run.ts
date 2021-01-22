import Rule from "./Rule"
import Context from "./Context"
import type { Report, Messages, RuleMatchers } from "./types"
import formatReport from "./utils/formatReport"
import execStdout from "./utils/execStdout"
import createFilesFilter from "./filters/files"
// import createLabelsFilter from "./filters/labels"
import createCommitsFilter from "./filters/commits"
import RuleFilter, { RuleFiltersMap } from "./RuleFilter"

async function getAllFiles() {
	let stdout = await execStdout("git", ["ls-tree", "--name-only", "-r", danger.git.head])
	let files = stdout.split("\n")
	return files
}

async function _run(rules: Rule<Messages, RuleMatchers>[]) {
	let reports: Report[] = []
	let allFiles

	// TODO: This is bad, but it's a temporary fix to stop making noise in PRs
	// that aren't based on the primary branch.
	try {
		allFiles = await getAllFiles()
	} catch (error) {
		console.warn("Git failed, bailing out.")
		return
	}

	let ruleFiltersMap: RuleFiltersMap = {
		files: createFilesFilter(allFiles),
		commits: createCommitsFilter(),
		// labels: createLabelsFilter(),
	}

	for (let rule of rules) {
		if (!(rule instanceof Rule)) {
			throw new TypeError("Rules must be implemented with new Rule(...)")
		}

		let matched = await RuleFilter.any(ruleFiltersMap, rule.match)
		if (!matched) {
			continue
		}

		let context = new Context<Messages>((kind, messageId: any, location, values) => {
			reports.push({ rule, messageId, kind, location, values })
		})

		let ruleValues = await RuleFilter.buildRuleValues(ruleFiltersMap, rule.match, context)

		await rule.run(ruleValues)
	}

	for (let report of reports) {
		let msg = formatReport(report)

		let file = report.location.file?.path
		let line = report.location.line?.lineNumber

		if (report.kind === "fail") {
			fail(msg, file, line)
		} else if (report.kind === "warn") {
			warn(msg, file, line)
		} else if (report.kind === "message") {
			message(msg, file, line)
		} else {
			throw new Error("Unknown report kind")
		}
	}
}

export default function run(...rules: Rule<any, any>[]) {
	// Have to wrap this function to add `Rule<any, any>` so TS doesn't yell at people for no reason.
	return _run(rules)
}
