/* eslint-disable no-useless-escape */
import { writeFile } from "../file-system/fs";

const frontMatterSep = "---";

/**
 * Converts links to markdown files to links to "pretty" URLs supported by most content management
 * systems and static website generators. For example:
 *
 * `[My link](../my/link.md)` => `[My link](../my/link/)`
 *
 * @export
 * @param {string} markdown - The markdown content to transform
 * @param {boolean} isIndex - Whether the markdown is contained in a default index file (equivalent
 * to index.html)
 * @param {string} indexBaseName - The name used for default index files (e.g. index.md, readme.md)
 * @returns The same markdown as was passed in, with links beautified.
 */
export function mdLinksToPrettyLinks(
	markdown: string,
	isIndex: boolean,
	indexBaseName: string
): string {
	const matchRelativeLink = /\[([^\[\]]+)\]\((?!.*\/\/)([^)]+\))/gim;
	const matchRelativeLinkToMarkdownFile = /\[([^\[\]]+)\]\((?!.*\/\/)([^)]+\.md\))/gim;
	const pattern = isIndex ? matchRelativeLinkToMarkdownFile : matchRelativeLink;
	const prepend = isIndex ? "" : "../"; // Pretty URLs add an extra "step". E.g. /my/page.md => /my/page/

	const esc = indexBaseName.replace(".", "\\.");
	const replacers = [
		{ regex: new RegExp(`^` + esc + "$", "i"), repl: "./" }, // _index.md => ./
		{
			regex: new RegExp(`^\.\/` + esc + "$", "i"),
			repl: "./", // ./_index.md => ./
		},
		{ regex: new RegExp(`\/` + esc + "$", "i"), repl: "/" }, // anything/_index.md => anything/
		// TODO: { regex: new RegExp(`^/.+\.md$`, "gi"), repl: "" }, // /anything.md => /anything
		{ regex: new RegExp(`\.md$`, "gi"), repl: "" }, // anything.md => anything
	];

	let match: RegExpExecArray | null;
	let result = markdown;
	while ((match = pattern.exec(markdown))) {
		const linkText = match[1];
		const linkHref = match[2].substr(0, match[2].length - 1);
		let newLinkHref =
			prepend +
			replacers.reduce(
				(prev, curr) => prev.replace(curr.regex, curr.repl),
				linkHref
			);
		if (!isIndex) {
			newLinkHref = newLinkHref
				.replace(/\/\.\//, "/") // /./ => /
				.replace(/\.\.\/\//, "../"); // ..// => ../
		}
		const newLink = `[${linkText}](${newLinkHref.replace(/ /g, "-")})`;
		result = result.replace(match[0], newLink);
		// console.debug("Replaced link", { was: match[0], is: newLink });
	}

	return result;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const frontMatter = (metadata: { [key: string]: any }): string =>
	Object.keys(metadata).reduce(
		(frontMatterContent, key) =>
			frontMatterContent + `${key}: ${JSON.stringify(metadata[key])}` + "\n",
		frontMatterSep + "\n"
	) + frontMatterSep;

export const mdContent = (metadata: Record<string, unknown>, content: string): string =>
	frontMatter(metadata) + "\n\n" + content;

export const mdLink = (text: string, href: string): string =>
	`[${text}](${encodeURI(href)})`;

export function mdTableColumnHeaders(headers: string[]): string {
	return (
		mdTableRow(headers) +
		headers.reduce(
			(columns, column) => columns + `${"-".repeat(column.length + 2)}|`,
			"|"
		) +
		"\n"
	);
}

/**
 * Converts an array of strings to columns to form a single row in a markdown table
 *
 * @export
 * @param {...string[]} values - Values to form the row
 * @returns - A string containing a single table row in markdown format
 */
export function mdTableRow(values: string[]): string {
	return (
		values
			.reduce((columns, value) => columns + `${value} | `, "| ")
			.trimRight() + "\n"
	);
}

export function mdTableRows(values: string[][]): string {
	return values.reduce((rows, row) => rows + mdTableRow(row), "");
}

export const writeMarkdown = async (
	path: string,
	metadata: Record<string, unknown>,
	content: string
): Promise<string> => writeFile(path, mdContent(metadata, content)).then(() => path);
