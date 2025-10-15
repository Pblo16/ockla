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
  private lastResult: ExecutionResult | undefined;

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
      // Check if we can do an incremental update (Virtual DOM style)
      if (this.lastResult && this.canDoIncrementalUpdate(this.lastResult, result)) {
        // Send a message to update only the changed parts
        this.panel.webview.postMessage({
          command: 'updateDiff',
          data: this.getDiff(this.lastResult, result)
        });
      } else {
        // Full re-render
        this.panel.webview.html = this.getHtmlContent(result);
      }

      this.lastResult = result;

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
      ? `<div class="output">${this.formatOutputAsLines(result.output)}</div>`
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
   * Checks if we can do an incremental update instead of full re-render
   */
  private canDoIncrementalUpdate(oldResult: ExecutionResult, newResult: ExecutionResult): boolean {
    // Can only do incremental if both succeeded and no errors
    if (oldResult.success !== newResult.success || newResult.error) {
      return false;
    }

    // Must have output in both
    if (!oldResult.output || !newResult.output) {
      return false;
    }

    return true;
  }

  /**
   * Calculates the diff between old and new results (Virtual DOM style)
   */
  private getDiff(oldResult: ExecutionResult, newResult: ExecutionResult): any {
    const oldLines = oldResult.output?.split('\n') || [];
    const newLines = newResult.output?.split('\n') || [];

    // Find which lines were added, removed, or modified
    const changes: any = {
      executionTime: newResult.executionTime,
      success: newResult.success,
      outputChanges: []
    };

    // Simple diff: compare line by line
    const maxLen = Math.max(oldLines.length, newLines.length);

    for (let i = 0; i < maxLen; i++) {
      if (i >= oldLines.length) {
        // New line added
        changes.outputChanges.push({
          type: 'add',
          index: i,
          content: newLines[i]
        });
      } else if (i >= newLines.length) {
        // Line removed
        changes.outputChanges.push({
          type: 'remove',
          index: i
        });
      } else if (oldLines[i] !== newLines[i]) {
        // Line modified
        changes.outputChanges.push({
          type: 'modify',
          index: i,
          content: newLines[i]
        });
      }
    }

    return changes;
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
   * Formats output as individual lines for diff tracking
   */
  private formatOutputAsLines(output: string): string {
    // Check if output contains HTML tables
    if (output.includes('<table class="data-table">')) {
      // Split by table blocks and handle separately
      const parts: string[] = [];
      let remaining = output;

      while (remaining.length > 0) {
        const tableStart = remaining.indexOf('<table class="data-table">');

        if (tableStart === -1) {
          // No more tables, process remaining as regular lines
          if (remaining.trim()) {
            const lines = remaining.split('\n');
            lines.forEach(line => {
              if (line.trim()) {
                parts.push(`<div class="output-line">${this.escapeHtml(line)}</div>`);
              }
            });
          }
          break;
        }

        // Process text before table
        if (tableStart > 0) {
          const before = remaining.substring(0, tableStart);
          const lines = before.split('\n');
          lines.forEach(line => {
            if (line.trim()) {
              parts.push(`<div class="output-line">${this.escapeHtml(line)}</div>`);
            }
          });
        }

        // Find end of table
        const tableEnd = remaining.indexOf('</table>', tableStart);
        if (tableEnd === -1) break;

        // Extract and add table as-is (no escaping, no wrapping in output-line)
        const table = remaining.substring(tableStart, tableEnd + 8);
        parts.push(table);

        // Continue with remaining text
        remaining = remaining.substring(tableEnd + 8);
      }

      return parts.join('');
    }

    // No tables, process normally
    const lines = output.split('\n');
    return lines.map(line =>
      `<div class="output-line">${this.escapeHtml(line)}</div>`
    ).join('');
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
