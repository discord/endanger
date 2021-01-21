import { Rule } from "../src"

export default function checkAPIEndpointLimits() {
	return new Rule({
		match: {
			files: ["api/**/*.py"],
		},
		messages: {
			loginRequired: `
				Consider adding @login_required.
			`,
			rateLimit: `
				Strongly consider adding a @rate_limit to protect our backend.
			`,
		},

		async run({ files, context }) {
			for (const file of files.edited) {
				for (const line of await file.diff().added()) {
					if (await line.contains("@route")) {
						let hasRateLimit = false
						let hasLoginRequired = false

						for (const afterLine of await file.lines({ after: line })) {
							if (await afterLine.contains(/^def /)) {
								break
							}
							if (await afterLine.contains(/^@rate_limit/)) {
								hasRateLimit = true
							}
							if (await afterLine.contains(/^@login_required/)) {
								hasLoginRequired = true
							}
						}

						if (!hasRateLimit) {
							context.warn("rateLimit", { file, line })
						}
						if (!hasLoginRequired) {
							context.warn("loginRequired", { file, line })
						}
					}
				}
			}
		},
	})
}
