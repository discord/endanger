import { Rule } from "../src"

export default function preferTypeScript() {
	return new Rule({
		match: {
			files: ["**/*.{js,jsx,ts,tsx}"],
		},
		messages: {
			foundNewJSFile: `
				**Use TypeScript for new code files**

				All new frontend code should be written in TypeScript so we can leverage
				its functionality as much as possible. While the codebase will work with
				plain JavaScript files, it cannot ensure that this new code is safe, or
				provide any guarantees to other consumers of this code.

				[TypeScript Migration Proposal](https://company.document.thing/typescript-migration-proposal)
			`,
			foundJSFileWithManyChanges: `
				**Prefer TypeScript**

				Migrate JavaScript files to TypeScript when making major changes
			`,
			foundNewFlowFile: `
				**Prefer TypeScript**

				Don't create new Flow-typed files, use TypeScript
			`,
			foundChangedFlowFile: `
				**Prefer TypeScript**:

				Migrate Flow-typed JavaScript files to TypeScript
			`,
		},
		async run({ files, context }) {
			for (let file of files.touched) {
				if (file.matches("*.{js,jsx}")) {
					if (file.created) {
						context.warn("foundNewJSFile", { file })
					} else if (file.modifiedOnly) {
						if (await file.contains("// @flow")) {
							if (!(await file.before()?.contains("// @flow"))) {
								context.warn("foundNewFlowFile", { file })
							} else {
								context.warn("foundChangedFlowFile", { file })
							}
						} else if (await file.diff().changedBy({ added: 0.1, removed: 0.5 })) {
							context.warn("foundJSFileWithManyChanges", { file })
						}
					}
				}
			}
		},
	})
}
