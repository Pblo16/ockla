# Ockla - JavaScript Runner for VS Code

Ockla es una extensión de Visual Studio Code que te permite ejecutar código JavaScript directamente desde el editor y ver los resultados en un panel dedicado.

## ✨ Características

- **Ejecución instantánea**: Ejecuta código JavaScript con un comando simple
- **Soporte de módulos Node.js**: Importa y usa cualquier módulo de npm (`axios`, `lodash`, etc.)
- **Sintaxis ES6 y CommonJS**: Soporta tanto `import` como `require`
- **Panel de salida dedicado**: Visualiza resultados en un webview con formato elegante
- **Auto-run**: Ejecuta automáticamente el código al guardar archivos (configurable)
- **Entorno aislado**: El código se ejecuta en un contexto seguro usando VM
- **Tiempo de ejecución**: Muestra el tiempo que tardó en ejecutarse el código
- **Manejo de errores**: Visualización clara de errores con stack traces
- **Operaciones asíncronas**: Soporta Promises, async/await, y callbacks

## 🚀 Uso

### Comandos disponibles

- **Ockla: Run JS** (`ockla.runCode`): Ejecuta el código del archivo activo
- **Ockla: Clear Output** (`ockla.clearOutput`): Limpia el panel de salida
- **Ockla: Toggle Auto-Run** (`ockla.toggleAutoRun`): Activa/desactiva la ejecución automática al guardar

### Ejemplos de Uso

#### Usando módulos de Node.js

```javascript
// Sintaxis ES6
import axios from 'axios';

axios.get('https://api.example.com/data')
  .then(response => {
    console.log('Data:', response.data);
  })
  .catch(error => {
    console.error('Error:', error.message);
  });
```

```javascript
// Sintaxis CommonJS
const fs = require('fs');
const path = require('path');

console.log('Current directory:', process.cwd());
console.log('Node version:', process.version);
```

#### Expresiones simples

```javascript
2 + 2              // Muestra: 4
6 + 2              // Muestra: 8

const sum = (a, b) => a + b;
sum(5, 3)          // Muestra: 8

console.log('Hello, Ockla!');  // Muestra: Hello, Ockla!
```

#### Manejo de errores

```javascript
const riskyFunction = () => {
  throw new Error('Something went wrong!');
};

try {
  riskyFunction();
} catch (error) {
  console.error('Caught:', error.message);
}
```

### Atajos rápidos

Puedes asignar atajos de teclado personalizados en VS Code:
1. Abre la paleta de comandos (`Ctrl+Shift+P` o `Cmd+Shift+P`)
2. Busca "Preferences: Open Keyboard Shortcuts"
3. Busca "Ockla" y asigna tus atajos preferidos

### 📂 Flujo de Trabajo Típico

```bash
# 1. Crea o abre tu proyecto
cd ~/Projects/mi-proyecto

# 2. Instala las dependencias que necesites (LOCAL, no global)
pnpm install axios lodash

# 3. Abre VS Code en ese directorio
code .

# 4. Crea un archivo JS y escribe tu código
import axios from 'axios';
// ... tu código

# 5. Ejecuta con Ockla (Cmd+Shift+P -> Ockla: Run JS)
# ✅ Buscará axios en ~/Projects/mi-proyecto/node_modules
```

**Ockla detecta automáticamente el workspace folder del archivo que estás editando**, así que siempre usará los módulos correctos del proyecto.

## 📦 Requisitos

### Usando módulos de Node.js

Para usar módulos externos (como `axios`, `lodash`, etc.), debes instalarlos **localmente en tu proyecto**:

```bash
# En tu proyecto (NO global)
cd /ruta/a/tu/proyecto
npm install axios
# o
pnpm install axios
```

**⚠️ Importante**: 
- ✅ Ockla busca módulos en el `node_modules` **local del workspace**
- ❌ NO usa módulos instalados globalmente (`npm install -g`)
- ✅ Detecta automáticamente el workspace folder del archivo actual
- ✅ Soporta múltiples workspaces en VS Code

Los módulos integrados de Node.js (`fs`, `path`, `os`, etc.) están disponibles sin instalación.

## ⚙️ Configuración

Esta extensión contribuye las siguientes configuraciones:

- **`ockla.autoRunOnSave`**: Ejecutar automáticamente archivos JavaScript al guardar (default: `false`)
- **`ockla.autoShowPanel`**: Cambiar automáticamente al panel de salida al ejecutar (default: `false`)
- **`ockla.showExecutionTime`**: Mostrar tiempo de ejecución en el panel de salida (default: `true`)
- **`ockla.maxOutputLength`**: Longitud máxima de salida a mostrar en caracteres (default: `10000`)
- **`ockla.executionTimeout`**: Tiempo máximo de ejecución en milisegundos (default: `5000`)
- **`ockla.asyncTimeout`**: Tiempo de espera para operaciones asíncronas (setTimeout, Promises) en ms (default: `500`)

### Ejemplo de configuración

```json
{
  "ockla.autoRunOnSave": true,
  "ockla.showExecutionTime": true,
  "ockla.maxOutputLength": 15000,
  "ockla.executionTimeout": 10000,
  "ockla.asyncTimeout": 1000
}
```

### Nota sobre Operaciones Asíncronas

Ockla espera un tiempo configurable (`asyncTimeout`) para que las operaciones asíncronas se completen. Por defecto son 500ms. 

- Si tu código tiene `setTimeout` con más de 500ms, aumenta `asyncTimeout`
- Ejemplo: para un `setTimeout` de 2 segundos, configura `"ockla.asyncTimeout": 2500`
- Las Promises y async/await también respetan este timeout

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
