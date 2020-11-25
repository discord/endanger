import { exec } from "child_process"

export default function execStdout(command: string): Promise<string> {
	return new Promise((resolve, reject) => {
		exec(command, (error, stdout, stderr) => {
			if (error) {
				reject(error)
			} else {
				resolve(stdout)
			}
		})
	})
}
