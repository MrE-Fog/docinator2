import { statSafe, readdir, unlink, rmdir, files } from "./fs";
import { join } from "path";
import { mkdir } from "shelljs";

/**
 * Creates the specified path if it does not already exist
 *
 * @export
 * @param {string} path - The path to ensure the existence of
 * @returns - the provided path
 */
export async function ensure(path: string): Promise<string> {
	if (!(await exists(path))) {
		mkdir("-p", path);
	}

	return path;
}

/**
 * Returns true if the provided path exists and is a directory
 *
 * @export
 * @param {string} path - The path to check for existence
 * @returns - True if the specified directory exists, otherwise false
 */
export async function exists(path: string): Promise<boolean> {
	return !!(await isDir(path));
}

/**
 * Determines if the provided path is a directory
 *
 * @export
 * @param {string} path - The path to check
 * @returns - True if the provided path is a directory, otherwise false
 */
export async function isDir(path: string): Promise<boolean> {
	const stats = await statSafe(path);
	return !!stats && stats.isDirectory();
}

/**
 * Removes the directory at the specified path and all its contents
 *
 * @export
 * @param {string} path - The path to remove
 */
export async function remove(path: string): Promise<void> {
	if (await exists(path)) {
		const contents = await files(path);
		await Promise.all(contents.map((file) => unlink(file)));
		const dirs = await readdir(path);
		await Promise.all(dirs.map((dir) => remove(join(path, dir))));
		await rmdir(path);
	}
}
