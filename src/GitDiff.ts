import type { TextDiff } from "danger"
import Bytes from "./Bytes"
import type { DiffThresholds, GitDiffStats } from "./types"

function assertPercentage(value: number | undefined): value is number {
	if (typeof value !== "number") {
		return false
	}

	if (value < 0 || value > 1) {
		throw new Error("value should be number between 0 and 1 (as a percentage)")
	}

	return true
}

export default class GitDiff extends Bytes {
	private _gitDiffFilePath: string

	constructor(relativeFilePath: string) {
		super(async () => {
			let diff = await this._getDiff()
			return diff.diff
		})
		this._gitDiffFilePath = relativeFilePath
	}

	private async _getDiff(): Promise<TextDiff> {
		let diff = await danger.git.diffForFile(this._gitDiffFilePath)

		if (!diff) {
			throw new Error(`Couldn't get diff for file ${this._gitDiffFilePath}`)
		}

		return diff
	}

	/**
	 * only the added lines
	 */
	added(): Bytes {
		return new Bytes(async () => {
			let diff = await this._getDiff()
			return diff.diff
		})
	}

	/**
	 * only the removed lines
	 */
	removed(): Bytes {
		return new Bytes(async () => {
			let diff = await this._getDiff()
			return diff.diff
		})
	}

	/**
	 * Chunks of the changed lines
	 */
	async chunks(): Promise<Bytes[]> {
		let diff = await danger.git.structuredDiffForFile(this._gitDiffFilePath)
		if (!diff) {
			throw new Error(`Couldn't get diff for file ${this._gitDiffFilePath}`)
		}
		return diff.chunks.map((chunk) => {
			return new Bytes(() => chunk)
		})
	}

	/**
	 * Returns a JSONDiff of the file (assuming the file is JSON)
	 */
	async jsonDiff(): Promise<any> {
		throw new Error("unimplemented")
	}

	/**
	 * Returns a JSONPatch of the file (assuming the file is JSON)
	 */
	async jsonPatch(): Promise<any> {
		throw new Error("unimplemented")
	}

	/**
	 * Get stats on the diff (number of changed/added/removed/etc lines)
	 */
	async stats(): Promise<GitDiffStats> {
		let diff = await this._getDiff()
		return {
			changed: diff.diff.split("\n").length,
			added: diff.added.split("\n").length,
			removed: diff.removed.split("\n").length,
			before: diff.before.split("\n").length,
			after: diff.after.split("\n").length,
		}
	}

	/**
	 * Test if the diff contains changes greater than one of these thresholds
	 * (Thresholds are 0-1 as percentages)
	 */
	async changedBy(thresholds: DiffThresholds): Promise<boolean> {
		let stats = await this.stats()

		if (
			assertPercentage(thresholds.changed) &&
			stats.added / stats.after > thresholds.changed
		) {
			return true
		}

		if (
			assertPercentage(thresholds.added) &&
			stats.added / stats.after > thresholds.added
		) {
			return true
		}

		if (
			assertPercentage(thresholds.removed) &&
			stats.removed / stats.after > thresholds.removed
		) {
			return true
		}

		return false
	}
}
