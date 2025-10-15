import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { WEBVIEW_ID, WEBVIEW_TITLE } from '../constants';
import type { ExecutionResult } from '../types';

/**
 * Manages the webview panel for displaying code execution output
 */
export class OutputPanel {
  private panel: vscode.WebviewPanel | undefined;
  private disposables: vscode.Disposable[] = [];
  private context: vscode.ExtensionContext;

  constructor(context: vscode.ExtensionContext) {
    this.context = context;
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
    const statusText = result.success ? 'Ejecución exitosa' : 'Error en la ejecución';

    // Read the HTML template
    const htmlPath = path.join(this.context.extensionPath, 'src', 'ui', 'index.html');
    let htmlTemplate = fs.readFileSync(htmlPath, 'utf8');

    // Prepare conditional HTML sections
    const executionTimeHtml = result.executionTime
      ? `<div class="execution-time">${result.executionTime}ms</div>`
      : '';

    const outputHtml = result.output
      ? `<div class="output">${this.escapeHtml(result.output)}</div>`
      : '';

    const emptyOutputHtml = !result.output && result.success
      ? '<div class="output empty">Sin salida</div>'
      : '';

    const errorHtml = result.error
      ? `<div class="error-message">${this.escapeHtml(result.error)}</div>`
      : '';

    // Replace template variables
    htmlTemplate = htmlTemplate
      .replace(/\{\{theme\}\}/g, theme)
      .replace(/\{\{WEBVIEW_TITLE\}\}/g, WEBVIEW_TITLE)
      .replace(/\{\{statusClass\}\}/g, statusClass)
      .replace(/\{\{statusIcon\}\}/g, statusIcon)
      .replace(/\{\{statusText\}\}/g, statusText)
      .replace(/\{\{executionTimeHtml\}\}/g, executionTimeHtml)
      .replace(/\{\{outputHtml\}\}/g, outputHtml)
      .replace(/\{\{emptyOutputHtml\}\}/g, emptyOutputHtml)
      .replace(/\{\{errorHtml\}\}/g, errorHtml);

    return htmlTemplate;
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
