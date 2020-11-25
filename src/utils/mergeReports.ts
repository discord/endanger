import { Report, ReportLocation, ReportKind } from "../types"

export default function mergeReports(reports: Report[]): Report[] {
	if (reports.length <= 3) {
		return reports
	}

	let hasWarn = false
	let hasFail = false
	let rule = reports[0].rule
	let messageId = reports[0].messageId
	let locations: ReportLocation[] = []

	for (let report of reports) {
		if (report.rule !== rule) {
			throw new Error("Cannot merge messages from different rules")
		}
		if (report.messageId !== messageId) {
			throw new Error("Cannot merge different messages")
		}
		if (report.kind === "warn") {
			hasWarn = true
		}
		if (report.kind === "fail") {
			hasFail = true
		}
		locations = locations.concat(report.locations)
	}

	let kind: ReportKind = hasFail ? "fail" : hasWarn ? "warn" : "message"

	return [
		{
			kind,
			rule,
			messageId,
			locations,
		},
	]
}
