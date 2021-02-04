import Rule from "./Rule"
import Context from "./Context"
import File from "./File"
import Line from "./Line"
import DiffLine from "./DiffLine"
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

async function getLineNumber(
	file: File,
	line: Line | DiffLine | undefined,
): Promise<number | undefined> {
	if (line instanceof DiffLine) {
		if (line.removed) {
			return line.lineNumberAfter!
		} else {
			return line.lineNumberBefore!
		}
	} else if (line instanceof Line) {
		return line.lineNumber
	} else {
		let lines = await file.diff().changed()
		if (lines[0]) {
			return getLineNumber(file, lines[0])
		} else {
			return
		}
	}
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

		try {
			await rule.run(ruleValues)
		} catch (error) {
			error.message = `${error.message} (from rule ${rule.callsites[1].getFileName()})`
			throw error
		}
	}

	for (let report of reports) {
		let msg = formatReport(report)

		let file: string | undefined
		let line: number | undefined

		if (report.location.file != null) {
			file = report.location.file.path
			line = await getLineNumber(report.location.file, report.location.line)
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

export default function run(...rules: Rule<any, any>[]) {
	// Have to wrap this function to add `Rule<any, any>` so TS doesn't yell at people for no reason.
	return _run(rules)
}
