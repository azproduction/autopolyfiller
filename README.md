# Autopolyfiller

This is like [Autoprefixer](https://github.com/ai/autoprefixer), but for JavaScript polyfills

## Installation

`autopolyfiller` can be installed using `npm`:

```
npm install autopolyfiller
```

## Example

```js
var Lookup = require('autopolyfiller');

var code = new Lookup('"".trim();Object.create(null);');

code.find();
// ['String.prototype.trim', 'Object.create']
```
