import type { Reader } from "./types"

export default class Bytes {
	private _reader: Reader

	constructor(reader: Reader) {
		this._reader = reader
	}

	/**
	 * Read the contents of this file/diff/etc.
	 */
	async contents(): Promise<string> {
		let contents = this._reader()
		return contents
	}

	/**
	 * Does this file/diff/etc contain a string or match a regex?
	 */
	async contains(matcher: string | RegExp): Promise<boolean> {
		let contents = await this.contents()
		if (typeof matcher === "string") {
			return contents.includes(matcher)
		} else {
			return matcher.test(contents)
		}
	}

	/**
	 * Read this file/diff/etc line by line
	 */
	async lines(): Promise<string[]> {
		let contents = await this.contents()
		return contents.split("\n")
	}
}
