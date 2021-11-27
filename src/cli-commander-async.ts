import commander, { CommanderStatic } from "commander";

const promises: Promise<unknown>[] = [];

type CommandInfo = {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	action: (...args: any[]) => Promise<any>;
	argsDescriptor?: string;
	description: string;
	name?: string;
};

export type RegisterActions = { to: (commander: CommanderStatic) => commander.Command };

/**
 * Registers an async action with commander so that the action can be awaited
 *
 * @export
 * @param {CommandInfo} {
 *   name,
 *   description,
 *   argsDescriptor,
 *   action,
 * } - Information about the command
 * @returns An action that enqueues execution of the provided action so that it can be awaited using the execute() function
 */
export function register({
	name,
	description,
	argsDescriptor,
	action,
}: CommandInfo): RegisterActions {
	return {
		to: function (parent: CommanderStatic) {
			const commandDescriptor = `${name || action.name} ${
				argsDescriptor || ""
			}`.trim();
			return parent
				.command(commandDescriptor)
				.description(description)
				.action(function (...args) {
					console.debug(`Executing ${commandDescriptor}`);
					promises.push(action(...args));
				});
		},
	};
}

/**
 * Awaits all executed async Commander actions
 *
 * @export
 */
export async function execute(): Promise<void> {
	await Promise.all(promises);
}
