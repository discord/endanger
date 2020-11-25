import Rule from "./Rule"
import GitFiles from "./GitFiles"
import Context from "./Context"
import ArrayMap from "./utils/ArrayMap"
import type { Report, Messages } from "./types"
import mergeReports from "./utils/mergeReports"
import formatReport from "./utils/formatReport"
import execStdout from "./utils/execStdout"
import matches from "./utils/matches"

async function getAllFiles() {
	let stdout = await execStdout(`git ls-tree --name-only -r ${danger.git.head}`)
	let files = stdout.split("\n")
	return files
}

export default async function run(...rules: Rule<any>[]) {
	let reportsMap = new ArrayMap<string, Report>()
	let allFiles = await getAllFiles()

	for (let rule of rules) {
		if (!(rule instanceof Rule)) {
			throw new TypeError("Rules must be implemented with new Rule(...)")
		}

		let filesState = danger.git.fileMatch(...rule.files)

		if (!(filesState.edited || filesState.deleted)) {
			continue
		}

		let matchingFiles = matches(allFiles, rule.files)
		let files = new GitFiles(matchingFiles, filesState.getKeyedPaths())
		let context = new Context<Messages>((kind, messageId: any, file, line) => {
			reportsMap.append(messageId, {
				rule,
				messageId,
				kind,
				locations: [{ file, line }],
			})
		})

		await rule.run(files, context)
	}

	for (let reports of Array.from(reportsMap.values())) {
		reports = mergeReports(reports)

		for (let report of reports) {
			let msg = formatReport(report)

			let file: string | undefined
			let line: number | undefined

			if (report.locations.length === 1) {
				file = report.locations[0].file?.path
				line = report.locations[0].line
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
