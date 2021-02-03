import type { KeyedPaths, GitMatchResult } from "danger"
import File from "./File"
import matches from "./utils/matches"
import unique from "./utils/unique"
import remove from "./utils/remove"

export default class Files {
	private _allFiles: string[]
	private _keyedPaths: KeyedPaths<GitMatchResult>

	constructor(allFiles: string[], keyedPaths: KeyedPaths<GitMatchResult>) {
		this._allFiles = allFiles
		this._keyedPaths = keyedPaths
	}

	/**
	 * Get all of the created files.
	 */
	get created(): File[] {
		return this._keyedPaths.created.map((filePath) => {
			return new File(filePath)
		})
	}

	/**
	 * Get all of the deleted files.
	 */
	get deleted(): File[] {
		return unique(this._keyedPaths.deleted).map((filePath) => {
			return new File(filePath)
		})
	}

	/**
	 * Get all of the modified files. (This doesn't include created files)
	 */
	get modifiedOnly(): File[] {
		return unique(this._keyedPaths.modified).map((filePath) => {
			return new File(filePath)
		})
	}

	/**
	 * Get all of the modified or created files.
	 */
	get modifiedOrCreated(): File[] {
		return unique(this._keyedPaths.edited).map((filePath) => {
			return new File(filePath)
		})
	}

	/**
	 * Get all of the touched (created, modified, or deleted) files.
	 */
	get touched(): File[] {
		return unique([...this._keyedPaths.edited, ...this._keyedPaths.deleted]).map((filePath) => {
			return new File(filePath)
		})
	}

	/**
	 * Get all of the untouched files.
	 */
	get untouched(): File[] {
		return remove(
			this._allFiles,
			unique([...this._keyedPaths.edited, ...this._keyedPaths.deleted]),
		).map((filePath) => {
			return new File(filePath)
		})
	}

	/**
	 * Get all files regardless of if they have been touched or not.
	 */
	get all(): File[] {
		return this._allFiles.map((filePath) => {
			return new File(filePath)
		})
	}

	/**
	 * Get a specific file.
	 */
	get(relativePath: string): File {
		if (danger.git.fileMatch(relativePath)) {
			return new File(relativePath)
		} else {
			throw new Error(`Could not find file ${relativePath}`)
		}
	}

	/**
	 * Filter files by a set of glob patterns
	 */
	matches(...patterns: string[]): Files {
		return new Files(matches(this._allFiles, patterns), {
			created: matches(this._keyedPaths.created, patterns),
			deleted: matches(this._keyedPaths.deleted, patterns),
			modified: matches(this._keyedPaths.modified, patterns),
			edited: matches(this._keyedPaths.edited, patterns),
		})
	}
}
