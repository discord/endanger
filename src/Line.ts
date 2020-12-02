import Bytes from "./Bytes"
import type { Reader } from "./types"

export default class Line extends Bytes {
	private _lineNumber: number

	constructor(lineNumber: number, reader: Reader) {
		super(reader)
		this._lineNumber = lineNumber
	}

	get lineNumber() {
		return this._lineNumber
	}
}
