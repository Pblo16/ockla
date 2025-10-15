import * as vscode from 'vscode';
import { WEBVIEW_ID, WEBVIEW_TITLE } from '../constants';
import type { ExecutionResult } from '../types';

/**
 * Manages the webview panel for displaying code execution output
 */
export class OutputPanel {
  private panel: vscode.WebviewPanel | undefined;
  private disposables: vscode.Disposable[] = [];

  constructor() {
    // Panel is created lazily
  }

  /**
   * Shows or creates the output panel
   */
  show(): void {
    if (this.panel) {
      this.panel.reveal(vscode.ViewColumn.Beside);
    } else {
      this.createPanel();
    }
  }

  /**
   * Updates the panel with execution results
   * @param result - The execution result to display
   * @param showPanel - Whether to show/reveal the panel (default: false for silent update)
   */
  update(result: ExecutionResult, showPanel: boolean = false): void {
    if (!this.panel) {
      this.createPanel();
    }

    if (this.panel) {
      this.panel.webview.html = this.getHtmlContent(result);

      // Only reveal the panel if explicitly requested
      if (showPanel) {
        this.panel.reveal(vscode.ViewColumn.Beside, true); // preserveFocus = true
      }
    }
  }

  /**
   * Clears the output panel
   */
  clear(): void {
    if (this.panel) {
      this.panel.webview.html = this.getHtmlContent({
        success: true,
        output: '',
      });
    }
  }

  /**
   * Disposes of the panel and its resources
   */
  dispose(): void {
    if (this.panel) {
      this.panel.dispose();
    }
    this.disposables.forEach(d => d.dispose());
    this.disposables = [];
  }

  /**
   * Creates the webview panel
   */
  private createPanel(): void {
    this.panel = vscode.window.createWebviewPanel(
      WEBVIEW_ID,
      WEBVIEW_TITLE,
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    );

    // Handle panel disposal
    this.panel.onDidDispose(
      () => {
        this.panel = undefined;
      },
      null,
      this.disposables
    );
  }

  /**
   * Generates HTML content for the webview
   * @param result - The execution result
   * @returns HTML string
   */
  private getHtmlContent(result: ExecutionResult): string {
    const theme = this.getThemeStyles();
    const statusClass = result.success ? 'success' : 'error';
    const statusIcon = result.success ? '✓' : '✗';

    return `<!DOCTYPE html>
<html lang="en">
<head>
	<meta charset="UTF-8">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<title>${WEBVIEW_TITLE}</title>
	<style>
		${theme}
		body {
			font-family: var(--vscode-font-family);
			font-size: var(--vscode-font-size);
			color: var(--vscode-foreground);
			background-color: var(--vscode-editor-background);
			padding: 20px;
			margin: 0;
		}
		.header {
			display: flex;
			align-items: center;
			gap: 10px;
			margin-bottom: 15px;
			padding-bottom: 10px;
			border-bottom: 1px solid var(--vscode-panel-border);
		}
		.status {
			display: flex;
			align-items: center;
			gap: 5px;
			font-weight: bold;
		}
		.status.success {
			color: var(--vscode-testing-iconPassed);
		}
		.status.error {
			color: var(--vscode-testing-iconFailed);
		}
		.execution-time {
			margin-left: auto;
			color: var(--vscode-descriptionForeground);
			font-size: 0.9em;
		}
		.output {
			white-space: pre-wrap;
			word-wrap: break-word;
			font-family: var(--vscode-editor-font-family);
			background-color: var(--vscode-textCodeBlock-background);
			padding: 15px;
			border-radius: 4px;
			border: 1px solid var(--vscode-panel-border);
			overflow-x: auto;
		}
		.error-message {
			color: var(--vscode-errorForeground);
			background-color: var(--vscode-inputValidation-errorBackground);
			border: 1px solid var(--vscode-inputValidation-errorBorder);
			padding: 15px;
			border-radius: 4px;
			margin-top: 10px;
		}
		.empty {
			color: var(--vscode-descriptionForeground);
			font-style: italic;
		}
	</style>
</head>
<body>
	<div class="header">
		<div class="status ${statusClass}">
			<span>${statusIcon}</span>
			<span>${result.success ? 'Ejecución exitosa' : 'Error en la ejecución'}</span>
		</div>
		${result.executionTime ? `<div class="execution-time">${result.executionTime}ms</div>` : ''}
	</div>
	
	${result.output ? `<div class="output">${this.escapeHtml(result.output)}</div>` : ''}
	${!result.output && result.success ? '<div class="output empty">Sin salida</div>' : ''}
	${result.error ? `<div class="error-message">${this.escapeHtml(result.error)}</div>` : ''}
</body>
</html>`;
  }

  /**
   * Gets CSS theme styles for the webview
   */
  private getThemeStyles(): string {
    return `
			:root {
				--vscode-testing-iconPassed: #73c991;
				--vscode-testing-iconFailed: #f14c4c;
			}
		`;
  }

  /**
   * Escapes HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;',
    };
    return text.replace(/[&<>"']/g, char => map[char]);
  }
}
