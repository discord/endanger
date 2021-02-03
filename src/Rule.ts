import type { Messages, RuleMatchers, RuleValues } from "./types"
import callsites, { CallSite } from "callsites"

export interface RuleOptions<M extends Messages, F extends RuleMatchers> {
	match: F
	messages: M
	run(values: RuleValues<M, F>): Promise<void> | void
}

export default class Rule<M extends Messages, F extends RuleMatchers> implements RuleOptions<M, F> {
	callsites: CallSite[]
	match: F
	messages: M
	run: (values: RuleValues<M, F>) => Promise<void> | void
	constructor(options: RuleOptions<M, F>) {
		if (options.match == null || Object.keys(options.match).length === 0) {
			throw new Error(`Your rule must have at least one filter. i.e. { match: { files: ["**"] } }`)
		}
		this.callsites = callsites()
		this.match = options.match
		this.messages = options.messages
		this.run = options.run
	}
}
