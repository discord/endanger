import type { GitMatchResult } from "danger"
import FileState from "./FileState"
import Diff from "./Diff"
import execStdout from "./utils/execStdout"

function getGitMatchResult(filePath: string): GitMatchResult {
	return danger.git.fileMatch(filePath)
}

export default class File extends FileState {
	constructor(relativeFilePath: string) {
		super(
			"after",
			relativeFilePath,
			(): Promise<string> => {
				return execStdout("git", ["show", `${danger.git.head}:${relativeFilePath}`])
			},
		)
	}

	/**
	 * Has the file been created?
	 */
	get created(): boolean {
		return getGitMatchResult(this.path).created
	}

	/**
	 * Has the file been deleted?
	 */
	get deleted(): boolean {
		return getGitMatchResult(this.path).deleted
	}

	/**
	 * Has the file been modified? (This doesn't include created files)
	 */
	get modifiedOnly(): boolean {
		return getGitMatchResult(this.path).modified
	}

	/**
	 * Has the file been modified or created?
	 */
	get modifiedOrCreated(): boolean {
		return getGitMatchResult(this.path).edited
	}

	/**
	 * Has the file been touched (created, modified, or deleted)?
	 */
	get touched(): boolean {
		let gitMatchResult = getGitMatchResult(this.path)
		return gitMatchResult.edited || gitMatchResult.deleted
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
	before(): FileState | null {
		if (this.created) {
			return null
		} else {
			return new FileState("before", this.path, () => {
				return execStdout("git", ["show", `${danger.git.base}:${this.path}`])
			})
		}
	}

	/**
	 * Get information about the diff of the file
	 */
	diff(): Diff {
		return new Diff(this)
	}
}
