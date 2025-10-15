// Ejemplo con operaciones asíncronas
console.log('Start');

setTimeout(() => {
  console.log('Timeout 1: After 100ms');
}, 100);

setTimeout(() => {
  console.log('Timeout 2: After 50ms');
}, 50);

// Usando Promises
const myPromise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve('Promise resolved!');
  }, 200);
});

myPromise.then(result => {
  console.log(result);
});

// Async/await
const asyncFunction = async () => {
  console.log('Async function started');

  const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  await wait(150);
  console.log('After 150ms wait');

  return 'Async completed';
};

asyncFunction().then(result => {
  console.log(result);
});

console.log('End (synchronous)');
