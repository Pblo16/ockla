/**
 * Constants for Ockla extension
 */

export const EXTENSION_ID = 'ockla';

export const COMMANDS = {
  RUN_CODE: 'ockla.runCode',
  TOGGLE_AUTO_RUN: 'ockla.toggleAutoRun',
  CLEAR_OUTPUT: 'ockla.clearOutput',
  STOP_EXECUTION: 'ockla.stopExecution',
} as const;

export const WEBVIEW_ID = 'ocklaOutput';
export const WEBVIEW_TITLE = 'Ockla Output';

export const FILE_PATTERNS = {
  JAVASCRIPT: '**/*.js',
  TYPESCRIPT: '**/*.ts',
} as const;

export const MESSAGES = {
  NO_ACTIVE_EDITOR: 'Abre un archivo JS para ejecutar con Ockla',
  AUTO_RUN_ENABLED: 'Ockla: Auto-run habilitado',
  AUTO_RUN_DISABLED: 'Ockla: Auto-run deshabilitado',
  EXECUTION_SUCCESS: 'Código ejecutado correctamente',
  EXECUTION_ERROR: 'Error al ejecutar el código',
} as const;
