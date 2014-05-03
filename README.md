# Autopolyfiller — Precise polyfills

[![NPM Version](https://badge.fury.io/js/autopolyfiller.png)](https://npmjs.org/package/autopolyfiller) [![Build Status](https://travis-ci.org/azproduction/autopolyfiller.png?branch=master)](https://travis-ci.org/azproduction/autopolyfiller) [![Coverage Status](https://coveralls.io/repos/azproduction/autopolyfiller/badge.png?branch=master&)](https://coveralls.io/r/azproduction/autopolyfiller) [![Dependency Status](https://gemnasium.com/azproduction/autopolyfiller.png)](https://gemnasium.com/azproduction/autopolyfiller)

This is like [Autoprefixer](https://github.com/ai/autoprefixer), but for JavaScript polyfills. It scans your code and applies only required polyfills. 

Assume you code is `Object.keys(window)`. `Object.keys` polyfill is required to run it [in any browser](http://kangax.github.io/es5-compat-table/#Object.keys) (include IE7). On the other hand this code can be executed on iOS 7 Safari without any polyfills. AutoPolyfiller knows about ES5 and ES6 features and their support in browsers. It can help you to write cutting-edge JavaScript without thinking about ES shims and shivs.

How it works. Step by step:

 1. Using AST matchers it scans your code and finds all polyfills
 2. If target browsers are specified, then it reduces the list of polyfills according to the "feature database"
 3. It generates polyfills code, using [polyfills database](https://github.com/jonathantneal/polyfill), which precisely fixes only required features

Limitations:

 * Right now it supports only safe and cross-browser [polyfiis from ES5](https://github.com/jonathantneal/polyfill), but you can add your own (see examples).
 * It can have a false-positives for some cases. For instance, autopolyfiller thinks that `$('div').map()` is call of `Array.prototype.map`. But you can exclude false-positives (see examples).

It will not work if:

 * You `eval` code with polyfills. Eg `eval('Object.keys(this)')`
 * You doing something odd. Eg `Object['k' + 'eys']()`

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

## Grunt, Gulp & Enb tasks

 * [grunt-autopolyfiller](https://github.com/azproduction/grunt-autopolyfiller/) - Grunt task for autopolyfiller.
 * [gulp-autopolyfiller](https://github.com/azproduction/gulp-autopolyfiller/) - Gulp task for autopolyfiller.
 * [enb-autopolyfiller](https://github.com/enb-make/enb-autopolyfiller/) - Enb task for autopolyfiller.

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

**Excluding/including polyfills**

```js
var autopolyfiller = require('autopolyfiller'),
    autoprefixer = require('autopolyfiller');

autopolyfiller()
.exclude(['Promise'])
.include(['String.prototype.trim'])
.add('new My.Promise();')
.polyfills;
// ['String.prototype.trim']
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
.add('Object.create();Object.newFeature();')
.polyfills;
// ['Object.create', 'Object.newFeature']

autopolyfiller('Chrome >= 20')
.add('Object.create();Object.newFeature();')
.polyfills;
// []
```
