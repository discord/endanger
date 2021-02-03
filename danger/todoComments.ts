import { Rule } from "../src"

export default function todoComments() {
	return new Rule({
		match: {
			files: ["**/*.{js,ts,tsx}"],
		},
		messages: {
			fixTodoComment: `
        Reminder: There's a TODO comment nearby some code you changed. If you
        added this comment, this is just a friendly reminder. If you did not add
        this comment but were just changing some nearby code, could you try to
        address it as part of your PR?
      `,
		},
		async run({ files, context }) {
			for (let file of files.modifiedOrCreated) {
				let lines = await file.diff().unified()

				for (let line of lines) {
					// Regex is close enough for our purposes since this is just a
					// warning on only the changed+nearby lines
					if (await line.contains(/\/[\/\*].*\bTODO\b.*/)) {
						context.warn("fixTodoComment", { file, line })
					}
				}
			}
		},
	})
}
