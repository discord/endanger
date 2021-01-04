import { Rule } from "../src"

export default function recommendStoreV2() {
	return new Rule({
		match: {
			files: ["android_app/**/Store*.kt"],
		},
		messages: {
			foundLegacyStoreWithManyChanges: `
        **Found a legacy store with many changes**

        Please consider migrating this to the new StoreV2 architecture.
      `,
		},
		async run({ files, context }) {
			for (let file of files.modified) {
				if (await file.diff().changedBy({ added: 0.1, removed: 0.3 })) {
					if (!(await file.contains("StoreV2"))) {
						context.warn("foundLegacyStoreWithManyChanges", { file })
					}
				}
			}
		},
	})
}
