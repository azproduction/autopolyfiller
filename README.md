# Autopolyfiller — Precise polyfills

[![NPM Version](https://badge.fury.io/js/autopolyfiller.png)](https://npmjs.org/package/autopolyfiller) [![Build Status](https://travis-ci.org/azproduction/autopolyfiller.png?branch=master)](https://travis-ci.org/azproduction/autopolyfiller) [![Coverage Status](https://coveralls.io/repos/azproduction/autopolyfiller/badge.png?branch=master&)](https://coveralls.io/r/azproduction/autopolyfiller) [![Dependency Status](https://gemnasium.com/azproduction/autopolyfiller.png)](https://gemnasium.com/azproduction/autopolyfiller)

This is like [Autoprefixer](https://github.com/ai/autoprefixer), but for JavaScript polyfills

How it works:

 * Using AST matchers it scans your code and finds all polyfills
 * If target browsers are specified, then it reduces the list of polyfills according to the "feature database"
 * It generates polyfills code which precisely fixes only required features

It will not work if:

 * You `eval` code with polyfills. Eg `eval('Object.keys(this)')`
 * You doing something odd. Eg `Object['k' + 'eys']()`

Todo:

 * Scan for square brackets expressions. Eg `Object['keys']()` [#3](https://github.com/azproduction/autopolyfiller/issues/3)
 * Scan for padded (by `this` or `window`) expressions. Eg `window.Object['keys']()` [#4](https://github.com/azproduction/autopolyfiller/issues/4)

## Installation 

`autopolyfiller` can be installed using `npm`:

```
npm install autopolyfiller
```

## CLI Example

```
$ autopolyfiller lib/**/*.js -b "Explorer 7, Chrome >= 10"
$ cat lib/*.js | autopolyfiller
```

## Grunt & Gulp tasks

 * [grunt-autopolyfiller](https://github.com/azproduction/grunt-autopolyfiller/) - Grunt task for autopolyfiller.
 * [gulp-autopolyfiller](https://github.com/azproduction/gulp-autopolyfiller/) - Gulp task for autopolyfiller.

## Example

```js
// Polyfills + Code
require('autopolyfiller')().add(code) + code;
```

**List of polyfills without browsers filtering**

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

**Default autoprefixer browsers**

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
        // For chrome 29 fix Object.newFeature
        'Chrome': [{
            only: '29',
            fill: 'Object.newFeature'
        }]
    },
    polyfill: {
        'Object.newFeature': 'Object.newFeature = function () {};'
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
