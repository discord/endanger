import type { TextDiff } from "danger"
import Line from "./Line"
import type File from "./File"
import type {
	DiffThresholds,
	GitDiffStats,
	StructuredDiff,
	UnifiedOptions,
} from "./types"

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
	private _file: File

	constructor(file: File) {
		this._file = file
	}

	/**
	 * Only the added lines
	 */
	async added(): Promise<Line[]> {
		if (this._file.created) {
			return await this._file.lines()
		}

		let diff = await getStructuredDiff(this._file.path)
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
	 * Only the removed lines
	 */
	async removed(): Promise<Line[]> {
		if (this._file.created) {
			return []
		}

		let diff = await getStructuredDiff(this._file.path)
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
	 * All of the changed lines
	 */
	async changed(): Promise<Line[]> {
		if (this._file.created) {
			return await this._file.lines()
		}

		let diff = await getStructuredDiff(this._file.path)
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
	 * All of the changed lines with `distance` lines of context.
	 */
	async unified(options: UnifiedOptions = {}): Promise<Line[]> {
		if (options.distance != null) {
			throw new Error(
				"diff.unified(..) with a `distance` is not currently supported",
			)
		}

		if (this._file.created) {
			return await this._file.lines()
		}

		let diff = await getStructuredDiff(this._file.path)
		let lines = []

		for (let chunk of diff.chunks) {
			for (let change of chunk.changes) {
				let lineNumber = change.normal ? change.ln2 : change.ln
				lines.push(
					new Line(lineNumber, () => {
						return cleanupDiffLines(change.content)
					}),
				)
			}
		}

		return lines

		// let distance = options.distance ?? 3

		// let allLines = await this._file.lines()
		// let lastLineNumber = allLines[allLines.length - 1].lineNumber

		// let changedLines = await this.changed()
		// let matchingLines: Record<number, true> = {}

		// for (let changedLine of changedLines) {
		// 	let start = Math.max(changedLine.lineNumber - distance, 0)
		// 	let end = Math.min(changedLine.lineNumber + distance, lastLineNumber)

		// 	for (let lineNumber = start; lineNumber <= end; lineNumber++) {
		// 		matchingLines[lineNumber] = true
		// 	}
		// }

		// let unifiedLines: Line[] = []

		// for (let line of allLines) {
		// 	if (matchingLines[line.lineNumber]) {
		// 		unifiedLines.push(line)
		// 	}
		// }

		// return unifiedLines
	}

	/**
	 * Get stats on the diff (number of changed/added/removed/etc lines)
	 */
	async stats(): Promise<GitDiffStats> {
		if (this._file.created) {
			let lines = await this._file.lines()
			return {
				changed: lines.length,
				added: lines.length,
				removed: 0,
				before: 0,
				after: lines.length,
			}
		} else {
			let diff = await getTextDiff(this._file.path)
			return {
				changed: diff.diff.split("\n").length,
				added: diff.added.split("\n").length,
				removed: diff.removed.split("\n").length,
				before: diff.before.split("\n").length,
				after: diff.after.split("\n").length,
			}
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
