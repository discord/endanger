import type { Messages, Reporter } from "./types"
import type File from "./File"
import Line from "./Line"

function getLineNumber(line: Line | number | undefined): number | undefined {
	return line instanceof Line ? line.lineNumber : line
}

export default class Context<M extends Messages> {
	private _reporter: Reporter<M>

	constructor(reporter: Reporter<M>) {
		this._reporter = reporter
	}

	warn(messageId: keyof M, file?: File, line?: number | Line): void {
		this._reporter("warn", messageId, file, getLineNumber(line))
	}

	fail(messageId: keyof M, file?: File, line?: number | Line): void {
		this._reporter("fail", messageId, file, getLineNumber(line))
	}

	message(messageId: string, file?: File, line?: number | Line): void {
		this._reporter("message", messageId, file, getLineNumber(line))
	}
}
