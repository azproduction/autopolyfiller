# Autopolyfiller

[![NPM Version](https://badge.fury.io/js/autopolyfiller.png)]
(https://npmjs.org/package/autopolyfiller)
[![Build Status](https://travis-ci.org/azproduction/autopolyfiller.png?branch=master)]
(https://travis-ci.org/azproduction/autopolyfiller)
[![Coverage Status](https://coveralls.io/repos/azproduction/autopolyfiller/badge.png?branch=master)]
(https://coveralls.io/r/azproduction/autopolyfiller)
[![Dependency Status](https://gemnasium.com/azproduction/autopolyfiller.png)]
(https://gemnasium.com/azproduction/autopolyfiller)

This is like [Autoprefixer](https://github.com/ai/autoprefixer), but for JavaScript polyfills

## Installation 

`autopolyfiller` can be installed using `npm`:

```
npm install autopolyfiller
```

## Example

**All possible polyfills without browsers filtering**

```js
var Lookup = require('autopolyfiller');

var code = new Lookup('"".trim();Object.create(null);');

code.find();
// ['String.prototype.trim', 'Object.create']
```

**Filtering using Autoprefixer-style [browser matchers](https://github.com/ai/autoprefixer#browsers)**

```js
var Lookup = require('autopolyfiller');

var code = new Lookup('"".trim();Object.create();new Promise()');

code.find(['IE 11', 'Chrome >= 31']);
// ['Promise']
```

**Custom polyfill matchers**

```js
var query = require('grasp-equery').query;
var Lookup = require('autopolyfiller');

Lookup.use({
    // Polyfill name
    name: 'Object.newFeature',

    // AST tree pattern matching
    test: function (ast) {
        return query('Object.newFeature(_$)', ast).length > 0;
    },

    // Map of browsers that support this feature
    support: {
        'chrome30': true
    }
});

var code = new Lookup('Object.newFeature()');

code.find();
// ['Object.newFeature']

code.find(['Chrome >= 30']);
// []
```
