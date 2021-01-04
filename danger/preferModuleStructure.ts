import { Rule } from "../src"

export default function preferModuleStructure(options: { projectDir: string }) {
	return new Rule({
		files: [`${options.projectDir}/**`],
		messages: {
			foundLegacyFileWithManyChanges: `
        **Consider moving this file to \`@app/modules\`**
        This PR makes substantial edits to this file. If possible, it'd be
        great to migrate this into the newer modules directory instead.
      `,
			foundNewLegacyFile: `
        **Consider adding this file to \`@app/modules\`**
        This file was added to a legacy directory. To help code stay structured
        as the codebase grows, new components and features should be added to
        the modules directory when possible.
      `,
			foundNewLegacyConstant: `
        **This constant can probably be moved into \`@app/modules\`**
        New constants should generally be added to the module they are used in
        to avoid further bloating the global Constants files. Even for
        constants that are used globally, scoping them to a module helps keep
        the codebase organized.
      `,
		},
		async run(files, context) {
			let legacyFiles = files.matches(
				`${options.projectDir}/{actions,stores,components,components_common,components_ios}/**/*`,
			)

			for (let legacyFile of legacyFiles.edited) {
				if (legacyFile.created) {
					context.warn("foundNewLegacyFile", { file: legacyFile })
				} else if (legacyFile.modified) {
					if (await legacyFile.diff()?.changedBy({ changed: 0.6 })) {
						context.warn("foundLegacyFileWithManyChanges", { file: legacyFile })
					}
				}
			}

			let constantFiles = files.matches(
				`${options.projectDir}/{Constants.tsx,ConstantsIOS.tsx}`,
			)

			for (let constantFile of constantFiles.modified) {
				let diff = constantFile.diff()
				for (let line of await diff.added()) {
					if (line.contains(/^\+?\w*export/)) {
						context.warn("foundNewLegacyConstant", {
							file: constantFile,
							line,
						})
					}
				}
			}
		},
	})
}
