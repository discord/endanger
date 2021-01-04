import { Rule, File, DiffThresholds } from "../src"

function hasMatchingStory(component: File, storybooks: File[]): boolean {
	let componentName = component.basename.split(".")[0].toLowerCase()

	for (let storybook of storybooks) {
		let storybookName = storybook.basename.split(".")[0].toLowerCase()
		if (storybookName.includes(componentName)) {
			return true
		}
	}

	return false
}

async function isSignificantChange(component: File): Promise<boolean> {
	let diff = component.diff()
	let stats = await diff.stats()

	let thresholds: DiffThresholds
	if (stats.before > 500) {
		// too complex
		thresholds = { changed: 0.3 }
	} else if (stats.before > 250) {
		// very complex
		thresholds = { changed: 0.4 }
	} else if (stats.before > 150) {
		// complex
		thresholds = { changed: 0.6 }
	} else {
		// ignore less complex components
		return false
	}

	return await diff.changedBy(thresholds)
}

export default function recommendStorybookExamples(options: {
	componentDir: string
	storybookDir: string
}) {
	let componentPattern = `${options.componentDir}/**/*.tsx`
	let storybookPattern = `${options.storybookDir}/**/*.tsx`
	return new Rule({
		files: [componentPattern, storybookPattern],
		messages: {
			foundNewComponentWithoutStory: `
				Please add a story for new components
			`,
			foundComponentWithManyChangesWithoutStory: `
				Since you made a major change this component, could you also make sure
				it has a corresponding story?
			`,
		},
		async run(files, context) {
			let components = files.matches(componentPattern).edited
			let storybooks = files.matches(storybookPattern).all

			for (let component of components) {
				if (!hasMatchingStory(component, storybooks)) {
					if (component.created) {
						context.warn("foundNewComponentWithoutStory", { file: component })
					} else if (component.modified) {
						if (await isSignificantChange(component)) {
							context.warn("foundComponentWithManyChangesWithoutStory", {
								file: component,
							})
						}
					}
				}
			}
		},
	})
}
