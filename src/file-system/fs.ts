import { promisify } from "util";
// import * as fs from "graceful-fs";
import * as fs from "fs";
import { dirname, sep, resolve, join, relative } from "path";
import { isDir, ensure } from "./directory";
import { copyIfNewer } from "./file";

export const MAX_OPEN_FILES = 512;

export const copyFile = promisify(fs.copyFile);
export const mkdir = promisify(fs.mkdir);
export const readdir = promisify(fs.readdir);
export const readFile = promisify(fs.readFile);
export const rename = promisify(fs.rename);
export const rmdir = promisify(fs.rmdir);
export const stat = promisify(fs.stat);
export const unlink = promisify(fs.unlink);
export const writeFile = promisify(fs.writeFile);

const noSuchFileOrDirectoryCode = "ENOENT";

export async function statSafe(path: string): Promise<fs.Stats | null> {
	try {
		return await stat(path);
	} catch (err) {
		return null;
	}
}

export function commonRoot(paths: string[]): string | undefined {
	return !paths || paths.length === 0
		? undefined
		: paths
			.map((path) => dirname(resolve(path)))
			.reduce((prev, curr) => {
				const prevParts = prev.split(sep);
				const currParts = curr.split(sep);
				return prevParts.filter((part, i) => part === currParts[i]).join(sep);
			});
}

export type CopyActions = { to: (destination: string) => Promise<string[]>; newerFiles: { to: (destination: string) => Promise<string[]>; }; };

export function copy(sourcePath?: string, ...includeOnly: string[]): CopyActions {
	const dirPath = sourcePath || commonRoot(includeOnly) || ".";
	const cp = async function (
		destination: string,
		cpFile: { (sourcePath: string, destPath: string): Promise<string | null> }
	) {
		await ensure(destination);
		if (!includeOnly || includeOnly.length === 0) {
			includeOnly = [dirPath];
		}
		const sourceFiles = await files(...includeOnly);
		const result: string[] = [];
		const work = sourceFiles.map((path) =>
			cpFile(path, join(destination, relative(dirPath, path))).then(
				(copied) => {
					if (copied) result.push(copied);
				}
			)
		);
		await Promise.all(work);
		return result;
	};

	return {
		to: async function (destination: string) {
			return cp(destination, async (src, dest) => {
				await copyFile(src, dest);
				return dest;
			});
		},
		newerFiles: {
			to: async function (destination: string) {
				return cp(destination, copyIfNewer);
			},
		},
	};
}

export async function exists(path: string): Promise<boolean> {
	try {
		return !!(await stat(path));
	} catch (err) {
		if ((err as { code: string }).code === noSuchFileOrDirectoryCode) {
			return false;
		}
		throw err;
	}
}

export async function files(...sources: string[]): Promise<string[]> {
	const result: string[] = [];
	const work: Promise<void>[] = [];
	for (const source of sources) {
		if (await isDir(source)) {
			work.push(
				readdir(source).then((contents) =>
					files(...contents.map((content) => join(source, content))).then(
						(files) => {
							result.push(...files);
						}
					)
				)
			);
		} else {
			result.push(source);
		}
	}
	await Promise.all(work);
	return result;
}

export async function dirs(sources: string[]): Promise<string[]> {
	const result: string[] = [];
	const work: Promise<void>[] = [];
	for (const source of sources) {
		if (await isDir(source)) {
			result.push(source);
			work.push(
				readdir(source).then((contents) =>
					dirs(contents.map((content) => join(source, content))).then(
						(directories) => {
							result.push(...directories);
						}
					)
				)
			);
		}
	}
	await Promise.all(work);
	return [...new Set(result)];
}