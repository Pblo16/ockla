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

    // Execute code
    const result = await this.codeExecutor.execute(code);

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
