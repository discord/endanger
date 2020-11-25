import type { GitMatchResult } from "danger"
import File from "./File"
import GitDiff from "./GitDiff"
import execStdout from "./utils/execStdout"

export default class GitFile extends File {
	constructor(relativeFilePath: string) {
		super(
			relativeFilePath,
			(): Promise<string> => {
				return execStdout(`git show ${danger.git.head}:${relativeFilePath}`)
			},
		)
	}

	private get _gitMatchResult(): GitMatchResult {
		return danger.git.fileMatch(this.path)
	}

	/**
	 * Has the file been created?
	 */
	get created(): boolean {
		return this._gitMatchResult.created
	}

	/**
	 * Has the file been deleted?
	 */
	get deleted(): boolean {
		return this._gitMatchResult.deleted
	}

	/**
	 * Has the file been modified?
	 */
	get modified(): boolean {
		return this._gitMatchResult.modified
	}

	/**
	 * Has the file been edited (created or modified)?
	 */
	get edited(): boolean {
		return this._gitMatchResult.edited
	}

	/**
	 * Has the file been touched (created, modified, or deleted)?
	 */
	get touched(): boolean {
		return this._gitMatchResult.edited || this._gitMatchResult.deleted
	}

	/**
	 * Has the file been moved from another location?
	 */
	async moved(): Promise<boolean> {
		// let diff = await execStdout(`git diff -M ${danger.git.head} ${this.path}`)
		throw new Error("unimplemented")
	}

	/**
	 * Get the state of the file before all the changes made.
	 */
	before(): File | null {
		if (this.created) {
			return null
		} else {
			return new File(this.path, () => {
				return execStdout(`git show ${danger.git.base}:${this.path}`)
			})
		}
	}

	/**
	 * Get information about the diff of the file
	 */
	diff(): GitDiff | null {
		if (this.created) {
			return null
		} else {
			return new GitDiff(this.path)
		}
	}
}
