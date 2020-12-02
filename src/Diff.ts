import type { TextDiff } from "danger"
import Line from "./Line"
import type { DiffThresholds, GitDiffStats, StructuredDiff } from "./types"

function assertPercentage(value: number | undefined): value is number {
	if (typeof value !== "number") {
		return false
	}

	if (value < 0 || value > 1) {
		throw new Error("value should be number between 0 and 1 (as a percentage)")
	}

	return true
}

async function getTextDiff(filePath: string): Promise<TextDiff> {
	let diff = await danger.git.diffForFile(filePath)

	if (!diff) {
		throw new Error(`Couldn't get diff for file ${filePath}`)
	}

	return diff
}

async function getStructuredDiff(filePath: string): Promise<StructuredDiff> {
	let diff = await danger.git.structuredDiffForFile(filePath)

	if (!diff) {
		throw new Error(`Couldn't get diff for file ${filePath}`)
	}

	return diff
}

function cleanupDiffLines(lines: string) {
	return lines.replace(/^[\+\- ]/gm, "")
}

export default class Diff {
	private _relativeFilePath: string

	constructor(relativeFilePath: string) {
		this._relativeFilePath = relativeFilePath
	}

	/**
	 * only the added lines
	 */
	async added(): Promise<Line[]> {
		let diff = await getStructuredDiff(this._relativeFilePath)
		let lines = []

		for (let chunk of diff.chunks) {
			for (let change of chunk.changes) {
				if (change.add) {
					lines.push(
						new Line(change.ln, () => {
							return cleanupDiffLines(change.content)
						}),
					)
				}
			}
		}

		return lines
	}

	/**
	 * only the removed lines
	 */
	async removed(): Promise<Line[]> {
		let diff = await getStructuredDiff(this._relativeFilePath)
		let lines = []

		for (let chunk of diff.chunks) {
			for (let change of chunk.changes) {
				if (change.del) {
					lines.push(
						new Line(change.ln, () => {
							return cleanupDiffLines(change.content)
						}),
					)
				}
			}
		}

		return lines
	}

	/**
	 * Chunks of the changed lines
	 */
	async changed(): Promise<Line[]> {
		let diff = await getStructuredDiff(this._relativeFilePath)
		let lines = []

		for (let chunk of diff.chunks) {
			for (let change of chunk.changes) {
				if (change.add || change.del) {
					lines.push(
						new Line(change.ln, () => {
							return cleanupDiffLines(change.content)
						}),
					)
				}
			}
		}

		return lines
	}

	/**
	 * Get stats on the diff (number of changed/added/removed/etc lines)
	 */
	async stats(): Promise<GitDiffStats> {
		let diff = await getTextDiff(this._relativeFilePath)
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
