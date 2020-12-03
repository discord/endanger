import execa from "execa"

export default async function execStdout(
	command: string,
	args: string[],
): Promise<string> {
	let result = await execa(command, args)
	return result.stdout
}
