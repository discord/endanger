import type { GitCommit } from "danger"
import contains, { Matcher } from "./utils/contains"

export default class Commit {
	private _commit: GitCommit

	constructor(commit: GitCommit) {
		this._commit = commit
	}

	/**
	 * Get the commit's SHA
	 */
	get sha(): string {
		return this._commit.sha
	}

	/**
	 * Get the commit's parents' SHA's.
	 */
	get parents(): string[] | null {
		return this._commit.parents ?? null
	}

	/**
	 * Get the commit message
	 */
	get message(): string {
		return this._commit.message
	}

	/**
	 * Does this commit have a message containing a string or matching a regex?
	 */
	contains(matcher: Matcher): boolean {
		return contains(this.message, matcher)
	}
}
