import path from "path"
import { parse as parseYaml } from "yaml"
import matches from "./utils/matches"
import Bytes from "./Bytes"
import Line from "./Line"
import type { Reader } from "./types"

export interface LinesOptions {
	after?: Line
	before?: Line
}

export default class FileState extends Bytes {
	private _filePath: string

	constructor(relativeFilePath: string, reader: Reader) {
		super(reader)
		this._filePath = relativeFilePath
	}

	/**
	 * Get the file path (relative to repo root)
	 */
	get path(): string {
		return this._filePath
	}

	/**
	 * Get the file basename
	 */
	get name(): string {
		return path.basename(this._filePath)
	}

	/**
	 * Get the file dirname (relative to repo root)
	 */
	get dirname(): string {
		return path.dirname(this._filePath)
	}

	/**
	 * Get the file basename
	 */
	get basename(): string {
		return path.basename(this._filePath, this.extension)
	}

	/**
	 * Get the file extension
	 */
	get extension(): string {
		return path.extname(this._filePath)
	}

	/**
	 * Does the file path match a set of glob patterns?
	 */
	matches(...patterns: string[]): boolean {
		return matches([this._filePath], patterns).length !== 0
	}

	/**
	 * Parse the file as JSON
	 */
	async json(): Promise<any> {
		return JSON.parse(await this.contents())
	}

	/**
	 * Parse the file as YAML
	 */
	async yaml(): Promise<any> {
		return parseYaml(await this.contents())
	}

	/**
	 * Read this file line by line
	 */
	async lines(options: LinesOptions = {}): Promise<Line[]> {
		let afterIndex: number | undefined
		let beforeIndex: number | undefined

		if (options.after) {
			afterIndex = options.after.lineNumber
		}
		if (options.before) {
			beforeIndex = options.before.lineNumber - 2
		}

		let contents = await this.contents()
		let rawLines = contents.split("\n").slice(afterIndex, beforeIndex)

		return rawLines.map((line, index) => {
			return new Line(index + 1, () => line)
		})
	}
}
