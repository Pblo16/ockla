/**
 * Type definitions for Ockla extension
 */

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime?: number;
}

export interface OcklaConfiguration {
  autoRunOnSave: boolean;
  showExecutionTime: boolean;
  maxOutputLength: number;
  enabledFileTypes: string[];
}

export interface CodeExecutionOptions {
  timeout?: number;
  memory?: number;
}
