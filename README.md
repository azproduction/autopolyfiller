# Autopolyfiller

[![NPM Version](https://badge.fury.io/js/autopolyfiller.png)]
(https://npmjs.org/package/autopolyfiller)
[![Build Status](https://travis-ci.org/azproduction/autopolyfiller.png?branch=master)]
(https://travis-ci.org/azproduction/autopolyfiller)
[![Coverage Status](https://coveralls.io/repos/azproduction/autopolyfiller/badge.png?branch=master&)]
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
var autopolyfiller = require('autopolyfiller');

autopolyfiller()
.add('"".trim();')
.polyfills;
// ['String.prototype.trim']
```

**Filtering using Autoprefixer-style [browser matchers](https://github.com/ai/autoprefixer#browsers)**

```js
var autopolyfiller = require('autopolyfiller');

autopolyfiller('IE 11', 'Chrome >= 31')
.add('"".trim();Object.create();new Promise()')
.polyfills;
// ['Promise']
```

**Default autoprefixer browsers*

```js
var autopolyfiller = require('autopolyfiller'),
    autoprefixer = require('autopolyfiller');

autopolyfiller(autoprefixer.default)
.add('new Promise();')
.polyfills;
// ['Promise']
```

**Custom polyfill matchers**

```js
var query = require('grasp-equery').query;
var autopolyfiller = require('autopolyfiller');

autopolyfiller.use({
    // AST tree pattern matching
    test: function (ast) {
        return query('Object.newFeature(_$)', ast).length > 0 ? ['Object.newFeature'] : [];
    },
    support: {
        'Object.newFeature': {
            'chrome 20': true
        }
    }
});

autopolyfiller()
.add('Object.create();Object.newFeature();');
.polyfills;
// ['Object.create', 'Object.newFeature']

autopolyfiller('Chrome >= 20')
.add('Object.create();Object.newFeature();');
.polyfills;
// []
```
