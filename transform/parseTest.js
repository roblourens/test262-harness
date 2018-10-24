const babylon = require('babylon');

const code = `const x = /foo/; let y = new RegExp("foo2")`;

console.log(JSON.stringify(babylon.parse(code), undefined, 2));