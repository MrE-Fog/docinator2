import { providers } from "./providers";
import { remove, isDir } from "./file-system/directory";
import { files } from "./file-system/fs";
import { join } from "path";

export const defaults = {
	builder: "hugo",
	destination: ".docinator",
	docsDirectoryName: "docs",
	source: ".",
	sources: ["."],
};

async function sourceFiles(sources: string[], destination: string): Promise<string[]> {
	sources = sources && sources.length ? sources : ["."];
	if (sources.length === 1 && (await isDir(sources[0]))) {
		sources = await files(sources[0]);
	}
	return sources.filter((path) => !path.startsWith(destination));
}

type BuildFlags = {
	builder: string;
	docsDirectoryName: string;
	clean: boolean;
	source: string;
	destination: string;
};

export async function build(
	files: string[] = defaults.sources,
	{
		builder,
		source,
		destination,
		docsDirectoryName,
		clean: cleanFirst,
	}: BuildFlags
): Promise<string[]> {
	builder = builder || defaults.builder;
	source = source || defaults.source;
	destination = destination || defaults.destination;
	docsDirectoryName = docsDirectoryName || defaults.docsDirectoryName;

	console.log("Building site", {
		files,
		source,
		destination,
		builder,
		clean: cleanFirst,
		docsDirectoryName,
	});

	if (cleanFirst) await clean(destination);

	files = await sourceFiles(files, destination);
	const docsPath = join(
		source,
		docsDirectoryName || defaults.docsDirectoryName
	);

	const builderImpl = providers[builder || defaults.builder];
	const result = await builderImpl.build(destination, docsPath, files);
	console.log("Build files created", result);
	return result;
}

export async function serve(
	files: string[] = defaults.sources,
	{
		builder,
		source,
		destination,
		docsDirectoryName,
		clean: cleanFirst,
	}: BuildFlags
): Promise<string[]> {
	builder = builder || defaults.builder;
	source = source || defaults.source;
	destination = destination || defaults.destination;
	docsDirectoryName = docsDirectoryName || defaults.docsDirectoryName;

	console.log("Serving site", {
		files,
		source,
		destination,
		builder,
		clean: cleanFirst,
		docsDirectoryName,
	});

	if (cleanFirst) await clean(destination);

	files = await sourceFiles(files, destination);
	const docsPath = join(
		source,
		docsDirectoryName || defaults.docsDirectoryName
	);

	// docinator build --source . --destination foo [paths]

	const builderImpl = providers[builder || defaults.builder];
	const result = await builderImpl.serve(destination, docsPath, files);
	console.log("Build files created", result);
	return result;
}

export async function clean(destination: string = defaults.destination): Promise<void> {
	console.log("Cleaning site", { destination });
	await remove(destination);
}
