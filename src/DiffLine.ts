import { Line } from "."
import Bytes from "./Bytes"
import type { StructuredDiffChange } from "./types"

function toContents(change: StructuredDiffChange) {
	if (change.add) {
		return change.content.replace(/^\+/, "")
	} else if (change.del) {
		return change.content.replace(/^-/, "")
	} else {
		return change.content.replace(/^ /, "")
	}
}

export default class DiffLine extends Bytes {
	private _change: StructuredDiffChange

	constructor(change: StructuredDiffChange) {
		super(() => {
			return toContents(change)
		})
		this._change = change
	}

	/**
	 * Has this diff line's content been addedd?
	 */
	get added(): boolean {
		return !!this._change.add
	}

	/**
	 * Has this diff line's content been removed?
	 */
	get removed(): boolean {
		return this._change.type === "del"
	}

	/**
	 * Has this diff line's content been changed (added or removed)?
	 */
	get changed(): boolean {
		return this._change.type !== "normal"
	}

	/**
	 * Is this diff line's content unchanged?
	 */
	get unchanged(): boolean {
		return this._change.type === "normal"
	}

	/**
	 * What is the line number before the change?
	 */
	get lineNumberBefore(): number | null {
		if (this._change.del) {
			return this._change.ln
		} else if (this._change.add) {
			return null
		} else {
			return this._change.ln2
		}
	}

	/**
	 * What is the line number after the change?
	 */
	get lineNumberAfter(): number | null {
		if (this._change.del) {
			return null
		} else if (this._change.add) {
			return this._change.ln
		} else {
			return this._change.ln2
		}
	}
}
