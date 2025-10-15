import * as vscode from 'vscode';
import { CodeExecutor } from './services/codeExecutor';
import { OutputPanel } from './ui/outputPanel';
import { RunCodeCommand, ClearOutputCommand, ToggleAutoRunCommand } from './commands';
import { FileWatcher } from './watchers/fileWatcher';
import { COMMANDS } from './constants';

/**
 * Extension activation entry point
 * @param context - VS Code extension context
 */
export function activate(context: vscode.ExtensionContext) {
	// Initialize services
	const codeExecutor = new CodeExecutor();
	const outputPanel = new OutputPanel();
	const fileWatcher = new FileWatcher(codeExecutor, outputPanel);

	// Initialize commands
	const runCodeCommand = new RunCodeCommand(codeExecutor, outputPanel);
	const clearOutputCommand = new ClearOutputCommand(outputPanel);
	const toggleAutoRunCommand = new ToggleAutoRunCommand();

	// Register commands
	context.subscriptions.push(
		vscode.commands.registerCommand(COMMANDS.RUN_CODE, () => runCodeCommand.execute())
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(COMMANDS.CLEAR_OUTPUT, () => clearOutputCommand.execute())
	);

	context.subscriptions.push(
		vscode.commands.registerCommand(COMMANDS.TOGGLE_AUTO_RUN, () => toggleAutoRunCommand.execute())
	);

	// Start file watcher
	fileWatcher.start();

	// Register disposables
	context.subscriptions.push(outputPanel);
	context.subscriptions.push(fileWatcher);
}

/**
 * Extension deactivation cleanup
 */
export function deactivate() {
	// Cleanup is handled by VS Code disposing of subscriptions
}
