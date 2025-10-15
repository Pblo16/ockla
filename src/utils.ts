import * as vscode from 'vscode';
import type { OcklaConfiguration } from './types';

/**
 * Utility functions for the Ockla extension
 */

/**
 * Gets the current Ockla configuration
 * @returns OcklaConfiguration object
 */
export function getConfiguration(): OcklaConfiguration {
  const config = vscode.workspace.getConfiguration('ockla');

  return {
    autoRunOnSave: config.get<boolean>('autoRunOnSave', false),
    showExecutionTime: config.get<boolean>('showExecutionTime', true),
    maxOutputLength: config.get<number>('maxOutputLength', 10000),
    enabledFileTypes: config.get<string[]>('enabledFileTypes', ['javascript']),
  };
}

/**
 * Checks if the current file is a JavaScript file
 * @param document - The text document to check
 * @returns true if the document is a JavaScript file
 */
export function isJavaScriptFile(document: vscode.TextDocument): boolean {
  return document.languageId === 'javascript';
}

/**
 * Formats execution time for display
 * @param ms - Time in milliseconds
 * @returns Formatted time string
 */
export function formatExecutionTime(ms: number): string {
  if (ms < 1000) {
    return `${ms}ms`;
  }
  return `${(ms / 1000).toFixed(2)}s`;
}

/**
 * Truncates text to a maximum length
 * @param text - The text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) {
    return text;
  }
  return text.substring(0, maxLength) + '\n\n... (output truncated)';
}
