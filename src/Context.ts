import type { Messages, Reporter, ReportLocation, Values } from "./types"

export default class Context<M extends Messages> {
	private _reporter: Reporter<M>

	constructor(reporter: Reporter<M>) {
		this._reporter = reporter
	}

	warn(messageId: keyof M, location: ReportLocation = {}, values: Values = {}): void {
		this._reporter("warn", messageId, location, values)
	}

	fail(messageId: keyof M, location: ReportLocation = {}, values: Values = {}): void {
		this._reporter("fail", messageId, location, values)
	}

	message(messageId: keyof M, location: ReportLocation = {}, values: Values = {}): void {
		this._reporter("message", messageId, location, values)
	}
}
