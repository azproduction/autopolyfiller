# Autopolyfiller — Precise polyfills

[![NPM Version](https://img.shields.io/npm/v/autopolyfiller.svg)](https://npmjs.org/package/autopolyfiller) [![Build Status](https://img.shields.io/travis/azproduction/autopolyfiller.svg)](https://travis-ci.org/azproduction/autopolyfiller) [![Coverage Status](https://img.shields.io/coveralls/azproduction/autopolyfiller.svg)](https://coveralls.io/r/azproduction/autopolyfiller) [![Code Climate](https://img.shields.io/codeclimate/github/azproduction/autopolyfiller.svg)](https://codeclimate.com/github/azproduction/autopolyfiller) [![Dependency Status](https://img.shields.io/gemnasium/azproduction/autopolyfiller.svg)](https://gemnasium.com/azproduction/autopolyfiller)

This is like [Autoprefixer](https://github.com/ai/autoprefixer), but for JavaScript polyfills. It scans your code and applies only required polyfills. [Live&nbsp;example](http://azproduction.github.io/autopolyfiller).

Assume you code is `Object.keys(window)`. `Object.keys` polyfill is required to run it [in any browser](http://kangax.github.io/es5-compat-table/#Object.keys) (include IE7). On the other hand this code can be executed on iOS 7 Safari without any polyfills. AutoPolyfiller knows about ES5 and ES6 features and their support in browsers. It can help you to write cutting-edge JavaScript without thinking about ES shims and shivs.

How it works. Step by step:

 1. Using AST matchers, it scans your code and finds all polyfills
 2. If target browsers are specified, then it reduces the list of polyfills according to the "feature database"
 3. It generates polyfills code, using [polyfills database](https://github.com/jonathantneal/polyfill), which precisely fixes only required features

Limitations:

 * Right now it supports only safe and cross-browser [polyfills from ES5](https://github.com/jonathantneal/polyfill), but you can add your own (see examples).
 * It can have a false-positives for some cases. For instance, autopolyfiller thinks that `$('div').map()` is call of `Array.prototype.map`. But you can exclude false-positives (see examples).

It will not work if:

 * You are `eval`ing code with polyfills. Eg `eval('Object.keys(this)')`
 * You are doing something odd. Eg `Object['k' + 'eys']()`

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

**Filtering using Autoprefixer-style [browser matchers](https://github.com/ai/browserslist#queries)**

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
var autopolyfiller = require('autopolyfiller');

autopolyfiller()
.exclude(['Promise'])
.include(['String.prototype.trim'])
// All Array polyfills
.include(['Array.*'])
.add('new My.Promise();')
.polyfills;
// ['String.prototype.trim']
```

**Using custom parser**

```js
var autopolyfiller = require('autopolyfiller');

autopolyfiller()
.withParser('acorn@0.11.0', {ecmaVersion: 6})
.add('array.map(x => x * x)')
.polyfills;
// ['Array.prototype.map']
```

**Adding your own polyfills**

```js
var query = require('grasp-equery').query;
var autopolyfiller = require('autopolyfiller');

autopolyfiller.use({
    // AST tree pattern matching
    // It may "grep" multiply polyfills
    test: function (ast) {
        return query('Object.newFeature(_$)', ast).length > 0 ? ['Object.newFeature'] : [];
    },

    // Your polyfills code
    polyfill: {
        'Object.newFeature': 'Object.newFeature = function () {};'
    },

    // This list means "apply this feature to the <list of browsers>"
    // For more examples see https://github.com/jonathantneal/polyfill/blob/master/agent.js.json
    support: {
        // For chrome 29 only apply Object.newFeature polyfill
        'Chrome': [{
            only: '29',
            fill: 'Object.newFeature'
        }]
    },

    // This is optional. By default autopolyfiller will use
    // polyfill's name to generate condition's code:
    wrapper: {
        'Object.newFeature': {
            'before': 'if (!("newFeature" in Object)) {',
            'after': '}'
        }
    }
});

autopolyfiller()
.add('Object.create();Object.newFeature();')
.polyfills;
// ['Object.create', 'Object.newFeature']

autopolyfiller()
.add('Object.newFeature();')
.toString();
// if (!("newFeature" in Object)) {
// Object.newFeature = function () {};
// }

autopolyfiller('Chrome >= 20')
.add('Object.create();Object.newFeature();')
.polyfills;
// []
```

## Handling polyfills issues

Right now Autopolyfiller aggreagates existing sources of polyfills. If you have any issues related to a polyfill code itself, please, add an issue or a pull request to the [jonathantneal/polyfill](https://github.com/jonathantneal/polyfill).

Here is how to temporary workaround, while your issue being resolved:
```js
var autopolyfiller = require('autopolyfiller');

autopolyfiller.use({
    polyfill: {
        'Function.prototype.bind': 'fixed code (!Function.prototype.bind)'
    }
});
```
