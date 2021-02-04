import Bytes from "./Bytes"
import type { StructuredDiffChange } from "./types"

function cleanupDiffLines(lines: string) {
	return lines.replace(/^[\+\- ]/gm, "")
}

export default class DiffLine extends Bytes {
	private _change: StructuredDiffChange

	constructor(change: StructuredDiffChange) {
		super(() => {
			return cleanupDiffLines(change.content)
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
