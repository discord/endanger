import { Rule } from "../src"

export default function commitJiraLink() {
	let TICKET_REGEX = /\b(JIRA-\d+)\b/
	return new Rule({
		match: {
			commits: [TICKET_REGEX],
		},
		messages: {
			jiraLink: `
        [View linked ticket {ticket} on JIRA](https://jira.intranet.corp/{ticket})
      `,
		},
		async run({ commits, context }) {
			for (let commit of commits) {
				let match = commit.message.match(TICKET_REGEX)
				if (match) {
					context.message("jiraLink", {}, { ticket: match[1] })
				}
			}
		},
	})
}
