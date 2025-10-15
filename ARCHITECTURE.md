# Ockla Architecture

## Overview

Ockla follows a modular architecture with clear separation of concerns. Each module is responsible for a specific aspect of the extension's functionality.

## Directory Structure

```
src/
├── extension.ts           # Entry point - orchestrates all modules
├── constants.ts           # Global constants and configuration
├── types.ts              # TypeScript type definitions
├── utils.ts              # Utility functions
├── commands/             # Command handlers
│   └── index.ts          # RunCodeCommand, ClearOutputCommand, ToggleAutoRunCommand
├── services/             # Business logic
│   └── codeExecutor.ts   # Code execution in sandboxed environment
├── ui/                   # User interface components
│   └── outputPanel.ts    # WebView panel for displaying results
└── watchers/             # File system watchers
    └── fileWatcher.ts    # Auto-run on file save
```

## Module Responsibilities

### extension.ts
- Extension activation/deactivation
- Module initialization
- Dependency injection
- Command registration

### constants.ts
- Command IDs
- WebView configurations
- File patterns
- User-facing messages

### types.ts
- TypeScript interfaces
- Type definitions for configuration
- Execution result types

### commands/
Command handlers that orchestrate services and UI updates:
- **RunCodeCommand**: Executes code from active editor
- **ClearOutputCommand**: Clears the output panel
- **ToggleAutoRunCommand**: Toggles auto-run feature

### services/codeExecutor.ts
Core business logic for code execution:
- Sandboxed JavaScript execution using Node.js VM
- Code validation
- Error handling
- Result formatting

### ui/outputPanel.ts
WebView panel management:
- Panel creation and lifecycle
- HTML generation with themed styles
- Result display formatting
- Error visualization

### watchers/fileWatcher.ts
File system monitoring:
- Watches for JavaScript file changes
- Triggers automatic execution
- Respects user configuration

### utils.ts
Helper functions:
- Configuration access
- File type detection
- Time formatting
- Text truncation

## Data Flow

1. **User Action** → Command invoked (manual or auto-run)
2. **Command** → Requests CodeExecutor to run code
3. **CodeExecutor** → Executes in sandboxed VM, returns ExecutionResult
4. **Command** → Passes result to OutputPanel
5. **OutputPanel** → Renders formatted HTML in WebView

## Design Patterns

### Dependency Injection
Services are injected into commands, making testing easier and reducing coupling.

### Single Responsibility
Each module has one clear purpose, making the codebase maintainable.

### Separation of Concerns
- Commands handle user interaction
- Services handle business logic
- UI handles presentation

## Extension Points

To add new features:

1. **New Command**: Add to `commands/` and register in `extension.ts`
2. **New Service**: Add to `services/` and inject where needed
3. **New Configuration**: Add to `package.json` contributions
4. **New UI Component**: Add to `ui/` following OutputPanel pattern

## Testing Strategy

- **Unit Tests**: Test individual services and utilities
- **Integration Tests**: Test command flow with mocked dependencies
- **E2E Tests**: Test full extension activation and command execution
