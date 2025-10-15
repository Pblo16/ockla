import { Script, createContext } from 'vm';
import type { ExecutionResult, CodeExecutionOptions } from '../types';
import * as module from 'module';
import * as path from 'path';

/**
 * Service responsible for executing JavaScript code in a sandboxed environment
 */
export class CodeExecutor {
  private readonly defaultTimeout = 5000; // 5 seconds

  /**
   * Executes JavaScript code and returns the result
   * @param code - The JavaScript code to execute
   * @param options - Execution options (timeout, memory limits, etc.)
   * @returns ExecutionResult with success status and output
   */
  async execute(code: string, options: CodeExecutionOptions = {}): Promise<ExecutionResult> {
    const startTime = Date.now();
    const outputs: string[] = [];

    try {
      // Convert ES6 imports to require statements
      const processedCode = this.convertImportsToRequire(code);

      // Use the working directory from options, or fall back to process.cwd()
      const workingDir = options.workingDirectory || process.cwd();

      // Create a custom require function from the working directory
      // This ensures we look for node_modules in the project directory, not globally
      const Module = require('module');
      const customRequire = Module.createRequire(path.join(workingDir, 'package.json'));

      // Prepare fetch and related Web APIs for the VM context
      let fetchFn: any = (globalThis as any).fetch;
      let HeadersCtor: any = (globalThis as any).Headers;
      let RequestCtor: any = (globalThis as any).Request;
      let ResponseCtor: any = (globalThis as any).Response;
      let AbortControllerCtor: any = (globalThis as any).AbortController;
      let FormDataCtor: any = (globalThis as any).FormData;
      let URLCtor: any = (globalThis as any).URL;
      let URLSearchParamsCtor: any = (globalThis as any).URLSearchParams;

      if (!fetchFn) {
        try {
          // Prefer undici if available locally in the project
          const undici = customRequire('undici');
          fetchFn = undici.fetch;
          HeadersCtor = undici.Headers;
          RequestCtor = undici.Request;
          ResponseCtor = undici.Response;
          AbortControllerCtor = undici.AbortController;
          // FormData, URL, URLSearchParams may also be provided by undici in recent versions
          FormDataCtor = (undici as any).FormData || FormDataCtor;
          URLCtor = (undici as any).URL || URLCtor;
          URLSearchParamsCtor = (undici as any).URLSearchParams || URLSearchParamsCtor;
        } catch (_) {
          // If undici is not installed, keep fetch undefined and we will expose a helpful error function
        }
      }

      // Prepare crypto (Web Crypto API / Node crypto)
      let cryptoGlobal: any = (globalThis as any).crypto;
      if (!cryptoGlobal) {
        try {
          // Try Node's crypto
          const nodeCrypto = customRequire('crypto');
          // Prefer webcrypto if available (Node >= 15)
          cryptoGlobal = (nodeCrypto as any).webcrypto || nodeCrypto;
        } catch (_) {
          // leave undefined; we will provide a helpful message on access
        }
      }

      // Create isolated context for code execution with output capturing
      const vmContext = createContext({
        console: {
          log: (...args: any[]) => {
            const output = args.map(arg => this.stringify(arg)).join(' ');
            outputs.push(output);
          },
          error: (...args: any[]) => {
            const output = args.map(arg => this.stringify(arg)).join(' ');
            outputs.push(`[ERROR] ${output}`);
          },
          warn: (...args: any[]) => {
            const output = args.map(arg => this.stringify(arg)).join(' ');
            outputs.push(`[WARN] ${output}`);
          },
        },
        require: customRequire,
        module: { exports: {} },
        exports: {},
        __dirname: workingDir,
        __filename: path.join(workingDir, 'script.js'),
        // Add common Node.js globals
        Buffer,
        global,
        setTimeout,
        setInterval,
        setImmediate,
        clearTimeout,
        clearInterval,
        clearImmediate,
        Promise,
        // Web-like APIs
        fetch: fetchFn || ((..._args: any[]) => { throw new Error("fetch is not available. Use Node >= 18 or install 'undici' locally (pnpm add undici)."); }),
        Headers: HeadersCtor,
        Request: RequestCtor,
        Response: ResponseCtor,
        AbortController: AbortControllerCtor,
        FormData: FormDataCtor,
        URL: URLCtor,
        URLSearchParams: URLSearchParamsCtor,
        // Crypto API
        crypto: cryptoGlobal || new Proxy({}, {
          get() {
            throw new Error("crypto is not available. Use Node >= 16 (webcrypto) or install Node's 'crypto' module (built-in). If this persists, ensure your runtime provides globalThis.crypto.");
          }
        }),
        // Polyfills / Web-like APIs
        atob: (str: string) => Buffer.from(str, 'base64').toString('binary'),
        btoa: (str: string) => Buffer.from(str, 'binary').toString('base64'),
        TextEncoder: (globalThis as any).TextEncoder || (require('util').TextEncoder),
        TextDecoder: (globalThis as any).TextDecoder || (require('util').TextDecoder),
        performance: (globalThis as any).performance || (function () { try { return require('perf_hooks').performance; } catch { return undefined; } })(),
        structuredClone: (globalThis as any).structuredClone || (function () { try { const { serialize, deserialize } = require('v8'); return (v: any) => deserialize(serialize(v)); } catch { return (v: any) => JSON.parse(JSON.stringify(v)); } })(),
        queueMicrotask: (globalThis as any).queueMicrotask || ((cb: Function) => Promise.resolve().then(() => cb())),
        Blob: (globalThis as any).Blob || (function () { try { return require('buffer').Blob; } catch { return undefined; } })(),
        navigator: {
          userAgent: `Ockla/${process.versions.node} Node/${process.version}`,
          platform: process.platform,
        },
        process: {
          env: process.env,
          cwd: () => process.cwd(),
          version: process.version,
          versions: process.versions,
          platform: process.platform,
          arch: process.arch,
          nextTick: process.nextTick,
        },
      });

      // Ensure window/self aliases exist in the VM global
      try {
        const sandboxGlobal = new Script('globalThis').runInContext(vmContext);
        (sandboxGlobal as any).window = sandboxGlobal;
        (sandboxGlobal as any).self = sandboxGlobal;
      } catch { /* ignore */ }

      // Wrap code to capture all expression results and wait for async operations
      const wrappedCode = this.wrapCodeForAsync(processedCode);
      const script = new Script(wrappedCode);

      script.runInContext(vmContext, {
        timeout: options.timeout || this.defaultTimeout,
      });

      // Wait for async operations to complete
      const asyncTimeout = options.asyncTimeout || 500;
      await this.waitForAsyncOperations(asyncTimeout);

      const executionTime = Date.now() - startTime;
      const output = outputs.length > 0 ? outputs.join('\n') : '(sin salida)';

      return {
        success: true,
        output,
        executionTime,
      };
    } catch (err) {
      const executionTime = Date.now() - startTime;
      const errorMessage = err instanceof Error ? err.message : String(err);

      return {
        success: false,
        output: outputs.length > 0 ? outputs.join('\n') : '',
        error: errorMessage,
        executionTime,
      };
    }
  }

  /**
   * Converts ES6 import statements to CommonJS require
   * @param code - The code with ES6 imports
   * @returns Code with require statements
   */
  private convertImportsToRequire(code: string): string {
    // Convert: import axios from 'axios' -> const axios = require('axios')
    code = code.replace(
      /import\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
      'const $1 = require(\'$2\')'
    );

    // Convert: import { a, b } from 'module' -> const { a, b } = require('module')
    code = code.replace(
      /import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"]/g,
      'const {$1} = require(\'$2\')'
    );

    // Convert: import * as name from 'module' -> const name = require('module')
    code = code.replace(
      /import\s+\*\s+as\s+(\w+)\s+from\s+['"]([^'"]+)['"]/g,
      'const $1 = require(\'$2\')'
    );

    return code;
  }

  /**
   * Wraps code to capture all expression results
   * @param code - The original code
   * @returns Wrapped code that logs all expressions
   */
  private wrapCodeToCapture(code: string): string {
    // Split code into lines for analysis
    const lines = code.split('\n');
    const wrappedLines: string[] = [];

    // Keywords that indicate we should not wrap
    const skipKeywords = [
      'const', 'let', 'var', 'function', 'class', 'import', 'export',
      'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'default',
      'try', 'catch', 'finally', 'throw', 'return', 'break', 'continue'
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Skip empty lines and comments
      if (!trimmedLine || trimmedLine.startsWith('//') || trimmedLine.startsWith('/*') || trimmedLine.startsWith('*')) {
        wrappedLines.push(line);
        continue;
      }

      // Skip lines with control flow keywords
      const startsWithKeyword = skipKeywords.some(keyword =>
        trimmedLine.startsWith(keyword + ' ') || trimmedLine.startsWith(keyword + '(')
      );

      if (startsWithKeyword) {
        wrappedLines.push(line);
        continue;
      }

      // Skip console statements (they already log)
      if (trimmedLine.includes('console.')) {
        wrappedLines.push(line);
        continue;
      }

      // Skip structural characters
      if (trimmedLine === '{' || trimmedLine === '}' || trimmedLine === '};' ||
        trimmedLine.endsWith('{') || trimmedLine === '})' || trimmedLine === ');') {
        wrappedLines.push(line);
        continue;
      }

      // Check if it's a simple expression to wrap
      if (this.isSimpleExpression(trimmedLine)) {
        const indent = line.match(/^\s*/)?.[0] || '';
        wrappedLines.push(`${indent}console.log(${trimmedLine})`);
      } else {
        wrappedLines.push(line);
      }
    }

    return wrappedLines.join('\n');
  }

  /**
   * Checks if a line is a simple expression that should be logged
   * @param line - The trimmed line to check
   * @returns true if it's a simple expression
   */
  private isSimpleExpression(line: string): boolean {
    // Only wrap very simple expressions
    const simplePatterns = [
      /^\d+\s*[\+\-\*\/\%]\s*\d+$/,  // Pure math: 2 + 2
      /^[\w]+\(\s*\)$/,              // Simple function calls: myFunc()
      /^[\w]+\s*[\+\-\*\/]\s*[\w]+$/, // Variable math: a + b
    ];

    return simplePatterns.some(pattern => pattern.test(line));
  }

  /**
   * Converts any value to a string representation
   * @param value - The value to stringify
   * @returns String representation of the value
   */
  private stringify(value: any): string {
    if (value === undefined) {
      return 'undefined';
    }
    if (value === null) {
      return 'null';
    }
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'function') {
      return value.toString();
    }
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  /**
   * Wraps code for async execution
   * @param code - The original code
   * @returns Wrapped code
   */
  private wrapCodeForAsync(code: string): string {
    // Use the existing wrap method
    return this.wrapCodeToCapture(code);
  }

  /**
   * Waits for async operations to complete
   * @param timeout - Maximum time to wait in milliseconds
   */
  private async waitForAsyncOperations(timeout: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, timeout);
    });
  }

  /**
   * Validates if the code is safe to execute
   * @param code - The code to validate
   * @returns true if code appears safe
   */
  validateCode(code: string): boolean {
    // Basic validation - can be extended
    if (!code || code.trim().length === 0) {
      return false;
    }
    return true;
  }
}
