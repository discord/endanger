import type Context from "./Context"
import type { RuleMatchers, RuleValues } from "./types"

export interface FilterOptions<Key extends keyof RuleMatchers> {
	matches(matcher: NonNullable<RuleMatchers[Key]>): Promise<boolean>
	build(matcher: NonNullable<RuleMatchers[Key]>): Promise<NonNullable<RuleValues<any, any>[Key]>>
}

type RuleValue<Key extends keyof RuleMatchers> = RuleValues<any, any>[Key]

export type RuleFiltersMap = {
	[Key in NonNullable<keyof RuleMatchers>]: RuleFilter<Key>
}

export default class RuleFilter<Key extends keyof RuleMatchers> {
	_options: FilterOptions<Key>

	constructor(options: FilterOptions<Key>) {
		this._options = options
	}

	/**
	 * Runs the filter's matches() function.
	 */
	async matches(matcher: RuleMatchers[Key]): Promise<boolean> {
		if (matcher == null) {
			return false
		}

		if (Array.isArray(matcher) && matcher.length === 0) {
			throw new Error("Filters cannot be empty arrays")
		}

		return this._options.matches(matcher!)
	}

	/**
	 * Runs the filter's build() function.
	 */
	async build(matcher: RuleMatchers[Key]): Promise<RuleValue<Key>> {
		if (matcher == null) {
			return null
		}

		if (Array.isArray(matcher) && matcher.length === 0) {
			throw new Error("Filters cannot be empty arrays")
		}

		return this._options.build(matcher!)
	}

	/**
	 * Do any of the rule filters match?
	 */
	static async any(ruleFiltersMap: RuleFiltersMap, ruleMatchers: RuleMatchers): Promise<boolean> {
		for (let key of Object.keys(ruleFiltersMap) as (keyof RuleMatchers)[]) {
			let result = await ruleFiltersMap[key].matches(ruleMatchers[key] as any)
			if (result) {
				return true
			}
		}
		return false
	}

	/**
	 * Build the RuleValues from filters.
	 */
	static async buildRuleValues(
		ruleFiltersMap: RuleFiltersMap,
		ruleMatchers: RuleMatchers,
		context: Context<any>,
	): Promise<RuleValues<any, any>> {
		let ruleValues: Partial<RuleValues<any, any>> = { context }

		for (let key of Object.keys(ruleFiltersMap) as (keyof RuleMatchers)[]) {
			ruleValues[key] = (await ruleFiltersMap[key].build(ruleMatchers[key] as any)) as any
		}

		return ruleValues as RuleValues<any, any>
	}
}
