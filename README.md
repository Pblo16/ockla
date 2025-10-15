# Ockla - JavaScript Runner for VS Code

Ockla es una extensión de Visual Studio Code que te permite ejecutar código JavaScript directamente desde el editor y ver los resultados en un panel dedicado.

## ✨ Características

- **Ejecución instantánea**: Ejecuta código JavaScript con un comando simple
- **Panel de salida dedicado**: Visualiza resultados en un webview con formato elegante
- **Auto-run**: Ejecuta automáticamente el código al guardar archivos (configurable)
- **Entorno aislado**: El código se ejecuta en un contexto seguro usando VM
- **Tiempo de ejecución**: Muestra el tiempo que tardó en ejecutarse el código
- **Manejo de errores**: Visualización clara de errores con stack traces

## 🚀 Uso

### Comandos disponibles

- **Ockla: Run JS** (`ockla.runCode`): Ejecuta el código del archivo activo
- **Ockla: Clear Output** (`ockla.clearOutput`): Limpia el panel de salida
- **Ockla: Toggle Auto-Run** (`ockla.toggleAutoRun`): Activa/desactiva la ejecución automática al guardar

### Atajos rápidos

Puedes asignar atajos de teclado personalizados en VS Code:
1. Abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`)
2. Busca "Preferences: Open Keyboard Shortcuts"
3. Busca "Ockla" y asigna tus atajos preferidos

## ⚙️ Configuración

Esta extensión contribuye las siguientes configuraciones:

- **`ockla.autoRunOnSave`**: Ejecutar automáticamente archivos JavaScript al guardar (default: `false`)
- **`ockla.showExecutionTime`**: Mostrar tiempo de ejecución en el panel de salida (default: `true`)
- **`ockla.maxOutputLength`**: Longitud máxima de salida a mostrar en caracteres (default: `10000`)
- **`ockla.executionTimeout`**: Tiempo máximo de ejecución en milisegundos (default: `5000`)

### Ejemplo de configuración

```json
{
  "ockla.autoRunOnSave": true,
  "ockla.showExecutionTime": true,
  "ockla.maxOutputLength": 15000,
  "ockla.executionTimeout": 10000
}
```

## 📁 Estructura del Proyecto

```
ockla/
├── src/
│   ├── extension.ts           # Punto de entrada principal
│   ├── constants.ts            # Constantes globales
│   ├── types.ts                # Definiciones de tipos TypeScript
│   ├── commands/               # Comandos de la extensión
│   │   └── index.ts
│   ├── services/               # Servicios de lógica de negocio
│   │   └── codeExecutor.ts
│   ├── ui/                     # Componentes de interfaz
│   │   └── outputPanel.ts
│   └── watchers/               # File watchers
│       └── fileWatcher.ts
├── package.json
└── README.md
```

## 🛠️ Desarrollo

### Requisitos

- Node.js 22.x o superior
- pnpm (recomendado) o npm

### Instalación

```bash
pnpm install
```

### Compilación

```bash
pnpm run compile
```

### Modo watch

```bash
pnpm run watch
```

### Pruebas

```bash
pnpm test
```

## 📝 Notas de la Versión

### 0.0.1

- ✅ Ejecución básica de código JavaScript
- ✅ Panel de salida con formato
- ✅ Auto-run al guardar (configurable)
- ✅ Manejo de errores mejorado
- ✅ Arquitectura modular y mantenible

## 🐛 Problemas Conocidos

- Actualmente solo soporta JavaScript (sin módulos ES6 externos)
- Las operaciones asíncronas tienen limitaciones en el entorno VM

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue primero para discutir los cambios que te gustaría realizar.

## 📄 Licencia

[MIT License](LICENSE)

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [Visual Studio Code's Markdown Support](http://code.visualstudio.com/docs/languages/markdown)
* [Markdown Syntax Reference](https://help.github.com/articles/markdown-basics/)

**Enjoy!**
