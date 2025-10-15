import * as vscode from 'vscode';
import { CodeExecutor } from '../services/codeExecutor';
import { OutputPanel } from '../ui/outputPanel';
import { FILE_PATTERNS } from '../constants';

/**
 * Watches for file changes and automatically runs JavaScript files when saved
 */
export class FileWatcher {
  private watcher: vscode.FileSystemWatcher | undefined;
  private disposables: vscode.Disposable[] = [];

  constructor(
    private codeExecutor: CodeExecutor,
    private outputPanel: OutputPanel
  ) { }

  /**
   * Starts watching for file changes
   */
  start(): void {
    if (this.watcher) {
      return; // Already watching
    }

    // Watch JavaScript files
    this.watcher = vscode.workspace.createFileSystemWatcher(FILE_PATTERNS.JAVASCRIPT);

    this.watcher.onDidChange(
      async (uri) => {
        await this.handleFileChange(uri);
      },
      null,
      this.disposables
    );

    this.disposables.push(this.watcher);
  }

  /**
   * Stops watching for file changes
   */
  stop(): void {
    this.dispose();
  }

  /**
   * Disposes of the watcher and its resources
   */
  dispose(): void {
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
    this.watcher = undefined;
  }

  /**
   * Handles file change events
   * @param uri - The URI of the changed file
   */
  private async handleFileChange(uri: vscode.Uri): Promise<void> {
    // Check if auto-run is enabled
    const config = vscode.workspace.getConfiguration('ockla');
    const autoRunEnabled = config.get<boolean>('autoRunOnSave', false);

    if (!autoRunEnabled) {
      return;
    }

    // Check if the file is currently open
    const doc = vscode.workspace.textDocuments.find(
      d => d.uri.toString() === uri.toString()
    );

    if (!doc) {
      return;
    }

    const code = doc.getText();

    if (!this.codeExecutor.validateCode(code)) {
      return;
    }

    // Execute code
    const result = await this.codeExecutor.execute(code);

    // Check if we should auto-show the panel
    const autoShowPanel = config.get<boolean>('autoShowPanel', false);

    // Update panel with results (show only if configured to do so)
    this.outputPanel.update(result, autoShowPanel);
  }
}
