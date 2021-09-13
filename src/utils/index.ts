import { exec as shellExec, ShellString } from "shelljs";

/**
 * Wraps the shelljs.exec command to add logging and error handling.
 *
 * @export
 * @param {string} command - The command to execute (please maintain shell/windows-command compatibility whenever possible)
 * @returns The result of the executed command
 */
export function exec(command: string): ShellString {
	console.log(command);
	const result = shellExec(command);
	console.log(result.stdout);

	if (result.code !== 0) {
		console.error(result.stderr);
		throw new Error(result.stderr.trim());
	}

	return result;
}

/**
 * Divides an array into multiple arrays
 *
 * @export
 * @param {unknown[]} array - the array to divide
 * @param {number} size - the desired chunk size
 * @returns - an array of arrays
 */
export function chunk<T>(array: T[], size: number): T[][] {
	const arrayCopy = [...array]; // Prevent mutation on slice()
	const result = [];
	for (let i = 0; i < arrayCopy.length; i += size) {
		// Do something if you want with the group
		result.push(arrayCopy.slice(i, i + size));
	}

	return result;
}

export async function batchProcess<TItem, TResult>(
  array: TItem[],
  size: number,
  processBatch: { (items: TItem[]): Promise<TResult> }
): Promise<void> {
	const batches = chunk(array, size);
	for (const batch of batches) {
		await processBatch(batch);
	}
}
