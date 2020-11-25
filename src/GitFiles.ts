import type { KeyedPaths, GitMatchResult } from "danger"
import GitFile from "./GitFile"
import matches from "./utils/matches"
import unique from "./utils/unique"
import execStdout from "./utils/execStdout"
import remove from "./utils/remove"

export default class GitFiles {
	private _allFiles: string[]
	private _keyedPaths: KeyedPaths<GitMatchResult>

	constructor(allFiles: string[], keyedPaths: KeyedPaths<GitMatchResult>) {
		this._allFiles = allFiles
		this._keyedPaths = keyedPaths
	}

	/**
	 * Get all of the created files.
	 */
	get created(): GitFile[] {
		return this._keyedPaths.created.map((filePath) => {
			return new GitFile(filePath)
		})
	}

	/**
	 * Get all of the deleted files.
	 */
	get deleted(): GitFile[] {
		return this._keyedPaths.deleted.map((filePath) => {
			return new GitFile(filePath)
		})
	}

	/**
	 * Get all of the modified files.
	 */
	get modified(): GitFile[] {
		return this._keyedPaths.modified.map((filePath) => {
			return new GitFile(filePath)
		})
	}

	/**
	 * Get all of the edited files.
	 */
	get edited(): GitFile[] {
		return this._keyedPaths.edited.map((filePath) => {
			return new GitFile(filePath)
		})
	}

	/**
	 * Get all of the touched files.
	 */
	get touched(): GitFile[] {
		return unique([
			...this._keyedPaths.edited,
			...this._keyedPaths.deleted,
		]).map((filePath) => {
			return new GitFile(filePath)
		})
	}

	/**
	 * Get all of the untouched files.
	 */
	get untouched(): GitFile[] {
		return remove(
			this._allFiles,
			unique([...this._keyedPaths.edited, ...this._keyedPaths.deleted]),
		).map((filePath) => {
			return new GitFile(filePath)
		})
	}

	/**
	 * Get all files regardless of if they have been touched or not.
	 */
	get all(): GitFile[] {
		return this._allFiles.map((filePath) => {
			return new GitFile(filePath)
		})
	}

	/**
	 * Get a specific file.
	 */
	get(relativePath: string): GitFile | null {
		if (danger.git.fileMatch(relativePath)) {
			return new GitFile(relativePath)
		} else {
			return null
		}
	}

	/**
	 * Filter files by a set of glob patterns
	 */
	matches(...patterns: string[]): GitFiles {
		return new GitFiles(matches(this._allFiles, patterns), {
			created: matches(this._keyedPaths.created, patterns),
			deleted: matches(this._keyedPaths.deleted, patterns),
			modified: matches(this._keyedPaths.modified, patterns),
			edited: matches(this._keyedPaths.edited, patterns),
		})
	}
}
