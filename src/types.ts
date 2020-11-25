import type {
	danger as Danger,
	fail as Fail,
	warn as Warn,
	message as Message,
	markdown as Markdown,
} from "danger"
import type GitFile from "./GitFile"
import type GitFiles from "./GitFiles"
import type Context from "./Context"
import type Rule from "./Rule"

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

export type ReportKind = "warn" | "fail" | "message"

export interface ReportLocation {
	file?: GitFile
	line?: number
}

export interface Report {
	kind: ReportKind
	rule: Rule<Messages>
	messageId: string
	locations: ReportLocation[]
}

export type Reporter<M extends Messages> = (
	kind: ReportKind,
	messageId: keyof M,
	file?: GitFile,
	line?: number,
) => void

export type Reader = () => Promise<string> | string

export interface Messages {
	[key: string]: string
}

export interface RuleOptions<M extends Messages> {
	files: string[]
	title: string
	description: string
	helpLink?: string
	messages: M
	run(files: GitFiles, context: Context<M>): Promise<void> | void
}

declare global {
	let danger: typeof Danger
	let fail: typeof Fail
	let warn: typeof Warn
	let message: typeof Message
	let markdown: typeof Markdown
}
