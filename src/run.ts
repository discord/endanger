import Rule from "./Rule"
import Context from "./Context"
import ArrayMap from "./utils/ArrayMap"
import Line from "./Line"
import type { Report, Messages, RuleMatchers, RuleValues } from "./types"
// import mergeReports from "./utils/mergeReports"
import formatReport from "./utils/formatReport"
import execStdout from "./utils/execStdout"
import createFilesFilter from "./filters/files"
// import createLabelsFilter from "./filters/labels"
import createCommitsFilter from "./filters/commits"
import RuleFilter, { RuleFiltersMap } from "./RuleFilter"

function getLineNumber(line: Line | number | undefined): number | undefined {
	return line instanceof Line ? line.lineNumber : line
}

async function getAllFiles() {
	let stdout = await execStdout("git", ["ls-tree", "--name-only", "-r", danger.git.head])
	let files = stdout.split("\n")
	return files
}

async function _run(rules: Rule<Messages, RuleMatchers>[]) {
	let reportsMap = new ArrayMap<string, Report>()
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
			reportsMap.append(messageId, {
				rule,
				messageId,
				kind,
				locations: [location],
				values,
			})
		})

		let ruleValues = await RuleFilter.buildRuleValues(ruleFiltersMap, rule.match, context)

		await rule.run(ruleValues)
	}

	for (let reports of Array.from(reportsMap.values())) {
		// TODO: Should rework this to be based on message contents not message keys
		// reports = mergeReports(reports)

		for (let report of reports) {
			let msg = formatReport(report)

			let file: string | undefined
			let line: number | undefined

			if (report.locations.length === 1) {
				file = report.locations[0].file?.path
				line = getLineNumber(report.locations[0].line)
			}

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
}

export default function run(...rules: Rule<any, any>[]) {
	// Have to wrap this function to add `Rule<any, any>` so TS doesn't yell at people for no reason.
	return _run(rules)
}
