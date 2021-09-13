import { stat, copyFile, exists } from "./fs";
import { ensure } from "./directory";
import { dirname } from "path";

/**
 * Copies the file at the specified source to the specified destination path only if the source
 * file is newer than the destination file, or if the destination file does not exist.
 *
 * @export
 * @param {string} source - The file to copy to the destination
 * @param {string} destination - The destination to copy the source file to
 * @returns - The destination path if copied, null if the copy was not performed
 */
export async function copyIfNewer(source: string, destination: string): Promise<string | null> {
	const newer =
		!(await exists(destination)) ||
		(await stat(source)).mtime > (await stat(destination)).mtime;

	if (newer) {
		await ensure(dirname(destination));
		await copyFile(source, destination);
		return destination;
	}

	return null;
}

/**
 * Provides the size of the file at the specified path in bytes.
 *
 * @export
 * @param {string} path - The path to the file to get the size of
 * @returns - The size of the file in bytes
 */
export async function size(path: string): Promise<number> {
	return (await stat(path)).size;
}
