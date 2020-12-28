import type {
	danger as Danger,
	fail as Fail,
	warn as Warn,
	message as Message,
	markdown as Markdown,
} from "danger"
import type File from "./File"
import type Files from "./Files"
import type Context from "./Context"
import type Rule from "./Rule"
import type Line from "./Line"

export interface StructuredDiffBaseChange {
	type: "add" | "del" | "normal"
	add: true | undefined
	del: true | undefined
	normal: true | undefined
	content: string
}

export interface StructuredDiffAddChange extends StructuredDiffBaseChange {
	type: "add"
	add: true
	del: undefined
	normal: undefined
	ln: number
}

export interface StructuredDiffDelChange extends StructuredDiffBaseChange {
	type: "del"
	add: undefined
	del: true
	normal: undefined
	ln: number
}

export interface StructuredDiffNormalChange extends StructuredDiffBaseChange {
	type: "normal"
	add: undefined
	del: undefined
	normal: true
	ln1: number
	ln2: number
}

export type StructuredDiffChange =
	| StructuredDiffAddChange
	| StructuredDiffDelChange
	| StructuredDiffNormalChange

export interface StructuredDiffChunk {
	content: string
	changes: StructuredDiffChange[]
	oldStart: number
	oldLines: number
	newStart: number
	newLines: number
}

export interface StructuredDiff {
	chunks: StructuredDiffChunk[]
}

export interface DiffThresholds {
	changed?: number
	added?: number
	removed?: number
}

export interface GitDiffStats {
	changed: number
	added: number
	removed: number
	before: number
	after: number
}

export interface UnifiedOptions {
	distance?: number
}

export type ReportKind = "warn" | "fail" | "message"

export interface ReportLocation {
	file?: File
	line?: number | Line
}

export interface Report {
	kind: ReportKind
	rule: Rule<Messages>
	messageId: string
	locations: ReportLocation[]
	values?: Values
}

export type Reporter<M extends Messages> = (
	kind: ReportKind,
	messageId: keyof M,
	location: ReportLocation,
	values: Values,
) => void

export type Reader = () => Promise<string> | string

export interface Messages {
	[key: string]: string
}

export type Values = Record<string, string>

export interface RuleOptions<M extends Messages> {
	files: string[]
	title: string
	description: string
	helpLink?: string
	messages: M
	run(files: Files, context: Context<M>): Promise<void> | void
}

declare global {
	let danger: typeof Danger
	let fail: typeof Fail
	let warn: typeof Warn
	let message: typeof Message
	let markdown: typeof Markdown
}
