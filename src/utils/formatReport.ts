import IntlMessageFormat, { FormatXMLElementFn } from "intl-messageformat"
import stripIndent from "strip-indent"
import { Report, ReportLocation } from "../types"

let SAFE_HTML_TAGS = [
	"h1",
	"h2",
	"h3",
	"h4",
	"h5",
	"h6",
	"h7",
	"h8",
	"br",
	"b",
	"i",
	"strong",
	"em",
	"a",
	"pre",
	"code",
	"img",
	"tt",
	"div",
	"ins",
	"del",
	"sup",
	"sub",
	"p",
	"ol",
	"ul",
	"table",
	"thead",
	"tbody",
	"tfoot",
	"blockquote",
	"dl",
	"dt",
	"dd",
	"kbd",
	"q",
	"samp",
	"var",
	"hr",
	"ruby",
	"rt",
	"rp",
	"li",
	"tr",
	"td",
	"th",
	"s",
	"strike",
	"summary",
	"details",
	"caption",
	"figure",
	"figcaption",
	"abbr",
	"bdo",
	"cite",
	"dfn",
	"mark",
	"small",
	"span",
	"time",
	"wbr",
]

function joinFormattedMessage(message: string | string[]): string {
	return Array.isArray(message) ? message.join("") : message
}

function createHtmlTag(htmlTag: string) {
	return (chunks: string[]) => {
		return `<${htmlTag}>${chunks.join("")}</${htmlTag}>`
	}
}

type Formatters = Record<
	string,
	| string
	| number
	| boolean
	| Date
	| FormatXMLElementFn<string, string | string[]>
	| null
	| undefined
>

let BASE_FORMATTERS: Formatters = {}

for (let htmlTag of SAFE_HTML_TAGS) {
	BASE_FORMATTERS[htmlTag] = createHtmlTag(htmlTag)
}

function locationToString(location: ReportLocation, joiner: string = ":") {
	if (location.file && location.line) {
		return `${location.file.path}:${location.line}`
	} else if (location.file) {
		return location.file.path
	} else {
		return ""
	}
}

function formatLocationLink(location: ReportLocation): string {
	if (danger.github) {
		return danger.github.utils.fileLinks([locationToString(location, "#L")])
	} else {
		return `./${locationToString(location)}`
	}
}

function createLocationsMarkup(locations: ReportLocation[]): string {
	if (locations.length === 0) {
		return ""
	} else if (locations.length === 1) {
		return formatLocationLink(locations[0])
	} else {
		return locations
			.map((location) => {
				return `- ${formatLocationLink(location)}`
			})
			.join("\n")
	}
}

export default function formatReport(report: Report) {
	let message = stripIndent(report.rule.messages[report.messageId]).trim()
	let formatter = new IntlMessageFormat(stripIndent(message).trim())
	let formatted = joinFormattedMessage(
		formatter.format<string>({
			...BASE_FORMATTERS,
			...report.values,
		}),
	)

	if (report.locations.length > 1) {
		let locationsMarkup = createLocationsMarkup(report.locations)
		formatted += `\n\n${locationsMarkup}`
	}

	return formatted
}
