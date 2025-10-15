# Ejemplos de Uso de Ockla

## 1. Módulos Integrados de Node.js

Los módulos integrados están disponibles sin instalación adicional:

```javascript
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('Platform:', process.platform);
console.log('Node version:', process.version);
```

## 2. Módulos Externos de npm

Primero instala el módulo en tu proyecto:

```bash
npm install axios
```

Luego úsalo en tu código:

```javascript
// Sintaxis ES6
import axios from 'axios';

// O sintaxis CommonJS
const axios = require('axios');

axios.get('https://jsonplaceholder.typicode.com/posts/1')
  .then(response => console.log(response.data))
  .catch(error => console.error(error.message));
```

## 3. Operaciones Asíncronas

### Callbacks y Timeouts

```javascript
console.log('Start');

setTimeout(() => {
  console.log('This runs after 1 second');
}, 1000);

console.log('End');
```

### Promises

```javascript
const fetchData = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({ data: 'Hello from Promise!' });
    }, 1000);
  });
};

fetchData()
  .then(result => console.log(result.data))
  .catch(error => console.error(error));
```

### Async/Await

```javascript
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const main = async () => {
  console.log('Starting...');
  
  await wait(1000);
  console.log('After 1 second');
  
  await wait(1000);
  console.log('After 2 seconds');
  
  return 'Done!';
};

main().then(result => console.log(result));
```

## 4. Manejo de Errores

### Try-Catch

```javascript
const riskyFunction = () => {
  throw new Error('Something went wrong!');
};

try {
  riskyFunction();
} catch (error) {
  console.error('Caught error:', error.message);
}
```

### Promise Error Handling

```javascript
const fetchData = async () => {
  throw new Error('API Error');
};

fetchData()
  .then(data => console.log(data))
  .catch(error => console.error('Error:', error.message));
```

## 5. Expresiones Simples

```javascript
// Matemáticas
2 + 2              // Output: 4
10 * 5             // Output: 50

// Funciones
const sum = (a, b) => a + b;
sum(5, 3)          // Output: 8

// Arrays
const arr = [1, 2, 3, 4, 5];
console.log('Sum:', arr.reduce((a, b) => a + b, 0));

// Objects
const user = { name: 'John', age: 30 };
console.log('User:', user);
```

## 6. Trabajando con Datos

### JSON

```javascript
const data = {
  name: 'Ockla',
  version: '1.0.0',
  features: ['fast', 'simple', 'powerful']
};

console.log(JSON.stringify(data, null, 2));
```

### Arrays

```javascript
const numbers = [1, 2, 3, 4, 5];

console.log('Original:', numbers);
console.log('Doubled:', numbers.map(n => n * 2));
console.log('Even:', numbers.filter(n => n % 2 === 0));
console.log('Sum:', numbers.reduce((a, b) => a + b, 0));
```

## 7. Módulos Populares

### lodash

```bash
npm install lodash
```

```javascript
import _ from 'lodash';

const arr = [1, 2, 3, 4, 5];
console.log('Chunk:', _.chunk(arr, 2));
console.log('Sum:', _.sum(arr));
```

### moment.js

```bash
npm install moment
```

```javascript
import moment from 'moment';

console.log('Now:', moment().format('YYYY-MM-DD HH:mm:ss'));
console.log('Tomorrow:', moment().add(1, 'days').format('YYYY-MM-DD'));
```

## Consejos

- ⚡ Usa `console.log()` para ver resultados
- 🔄 Las operaciones asíncronas funcionan correctamente
- 📦 Instala módulos externos en tu proyecto antes de usarlos
- 🎯 Los módulos integrados de Node.js están siempre disponibles
- 🚀 Usa auto-run para desarrollo rápido
