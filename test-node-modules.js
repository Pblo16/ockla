// Ejemplo usando módulos integrados de Node.js
const fs = require('fs');
const path = require('path');
const os = require('os');

console.log('--- Información del Sistema ---');
console.log('Platform:', process.platform);
console.log('Node version:', process.version);
console.log('CPU Architecture:', process.arch);
console.log('Home directory:', os.homedir());
console.log('Temp directory:', os.tmpdir());

console.log('\n--- Información del Proceso ---');
console.log('Current directory:', process.cwd());
console.log('PID:', process.pid);

console.log('\n--- Path utilities ---');
const filePath = '/home/user/documents/file.txt';
console.log('Directory:', path.dirname(filePath));
console.log('Basename:', path.basename(filePath));
console.log('Extension:', path.extname(filePath));
