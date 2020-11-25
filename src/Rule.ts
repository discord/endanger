import type GitFiles from "./GitFiles"
import type Context from "./Context"
import type { Messages } from "./types"

export interface RuleOptions<M extends Messages> {
	files: string[]
	messages: M
	run(files: GitFiles, context: Context<M>): Promise<void> | void
}

export default class Rule<M extends Messages> implements RuleOptions<M> {
	files: string[]
	messages: M
	run: (files: GitFiles, context: Context<M>) => Promise<void> | void
	constructor(options: RuleOptions<M>) {
		this.files = options.files
		this.messages = options.messages
		this.run = options.run
	}
}
