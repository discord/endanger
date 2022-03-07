import IntlMessageFormat, { FormatXMLElementFn } from "intl-messageformat"
import stripIndent from "strip-indent"
import unified from "unified"
import parse from "remark-parse"
import gfm from "remark-gfm"
import stringify from "remark-stringify"
import visit from "unist-util-visit"
import { Report } from "../types"

let markdown = unified().use(parse).use(gfm).use(stringify)

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

export default function formatReport(report: Report) {
	let ast = markdown.parse(stripIndent(report.rule.messages[report.messageId]).trim())

	visit(ast, "text", (node: any) => {
		// normalize line breaks
		node.value = node.value.split("\n").join(" ")
	})

	let message = markdown.stringify(ast)
	let formatter = new IntlMessageFormat(message)

	let formatted = joinFormattedMessage(
		formatter.format<string>({
			...BASE_FORMATTERS,
			...report.values,
		}),
	)

	return formatted.replace(/\n$/, '')
}
