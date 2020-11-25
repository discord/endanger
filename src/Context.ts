import type { Messages, Reporter } from "./types"
import type GitFile from "./GitFile"

export default class Context<M extends Messages> {
	private _reporter: Reporter<M>

	constructor(reporter: Reporter<M>) {
		this._reporter = reporter
	}

	warn(messageId: keyof M, file?: GitFile, line?: number): void {
		this._reporter("warn", messageId, file, line)
	}

	fail(messageId: keyof M, file?: GitFile, line?: number): void {
		this._reporter("fail", messageId, file, line)
	}

	message(messageId: string, file?: GitFile, line?: number): void {
		this._reporter("message", messageId, file, line)
	}
}
