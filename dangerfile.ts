import { run } from "./src"
import preferTypeScript from "./danger/preferTypeScript"
import recommendStoreV2 from "./danger/recommendStoreV2"
import recommendStorybookExamples from "./danger/recommendStorybookExamples"
import preferModuleStructure from "./danger/preferModuleStructure"
import todoComments from "./danger/todoComments"
import commitJiraLink from "./danger/commitJiraLink"

run(
	// Please add rules in alphabetical order
	preferTypeScript(),
	recommendStoreV2(),
	recommendStorybookExamples({
		componentDir: "uikit",
		storybookDir: "uikit-dev",
	}),
	recommendStorybookExamples({
		componentDir: "uikit-ios",
		storybookDir: "uikit-ios-dev",
	}),
	preferModuleStructure({
		projectDir: "app",
	}),
	todoComments(),
	commitJiraLink(),
)
