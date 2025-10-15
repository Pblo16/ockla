import * as vscode from 'vscode';
import { CodeExecutor } from '../services/codeExecutor';
import { OutputPanel } from '../ui/outputPanel';
import { MESSAGES } from '../constants';

/**
 * Handles the runCode command
 */
export class RunCodeCommand {
  constructor(
    private codeExecutor: CodeExecutor,
    private outputPanel: OutputPanel
  ) { }

  /**
   * Executes the run code command
   */
  async execute(): Promise<void> {
    const editor = vscode.window.activeTextEditor;

    if (!editor) {
      vscode.window.showWarningMessage(MESSAGES.NO_ACTIVE_EDITOR);
      return;
    }

    const code = editor.document.getText();

    if (!this.codeExecutor.validateCode(code)) {
      vscode.window.showErrorMessage('El código no es válido');
      return;
    }

    // Get the working directory from the file's location
    const workspaceFolder = vscode.workspace.getWorkspaceFolder(editor.document.uri);
    const workingDirectory = workspaceFolder ? workspaceFolder.uri.fsPath :
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ||
      process.cwd();

    // Get configuration
    const config = vscode.workspace.getConfiguration('ockla');
    const executionTimeout = config.get<number>('executionTimeout', 5000);
    const asyncTimeout = config.get<number>('asyncTimeout', 500);

    // Execute code
    const result = await this.codeExecutor.execute(code, {
      timeout: executionTimeout,
      asyncTimeout: asyncTimeout,
      workingDirectory: workingDirectory,
    });

    // Update panel with results and show it (manual execution)
    this.outputPanel.update(result, true);

    // Show notification
    if (!result.success) {
      vscode.window.showErrorMessage(`${MESSAGES.EXECUTION_ERROR}: ${result.error}`);
    }
  }
}

/**
 * Handles the clear output command
 */
export class ClearOutputCommand {
  constructor(private outputPanel: OutputPanel) { }

  execute(): void {
    this.outputPanel.clear();
  }
}

/**
 * Handles the toggle auto-run command
 */
export class ToggleAutoRunCommand {
  async execute(): Promise<void> {
    const config = vscode.workspace.getConfiguration('ockla');
    const currentValue = config.get<boolean>('autoRunOnSave', false);

    await config.update('autoRunOnSave', !currentValue, vscode.ConfigurationTarget.Global);

    const message = !currentValue ? MESSAGES.AUTO_RUN_ENABLED : MESSAGES.AUTO_RUN_DISABLED;
    vscode.window.showInformationMessage(message);
  }
}
