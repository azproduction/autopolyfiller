# Contribution Guide

This document describes some points about contribution process for autopolyfiller package.

The maintainer of the project is Mikhail Davydov (i@azproduction.ru).

The project is being developed within community. Maintainer merges pull-requests, fixes critical bugs.

## Pull-requests

If you fixed or added something useful to the project, you can send pull-request.
It will be reviewed by maintainer and accepted, or commented for rework, or declined.

## Bugs

If you found an error, mistype or any other flawback in the project, please report about it using github-issues.
The more details you provide, the easier it can be reproduced and the faster can be fixed.
Unfortunately, sometimes the bug can be only reproduced in your project or in your environment,
so maintainers cannot reproduce it. In this case we believe you can fix the bug and send us the fix.

## Features

It you've got an idea about a new feature, it's most likely that you have do implement it on your own.
If you cannot implement the feature, but it is very important, you can add a task in github-issues,
but expect it be declined by the maintainer.

## How to add a new polyfill

 - Write a polyfill's code
 - Name your polyfill
 - Write a AST matcher
 - Write a wrapper (optional)
 - Write tests

### 1. Write a polyfill's code

 - It should be tested
 - Idially should have 100% code coverage
 - It should be without a condition wrapper
 - It should be roboust (full spec coverage is welcome)

**Examples**

```js
// GOOD
String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, '');
};
```

```js
// BAD
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/g, '');
    };
}
```

### 2. Name your polyfill

 - It should be verbose (include prototype and a root object)

**Examples**

 - `String.prototype.trim` - GOOD
 - `strtrim`, `trim`, `trim-fix` - BAD

### 3. Write a AST matcher

 - It should be simple 
 - As fast as possible
 - It should cover edge cases like `Object['keys']()`

You can use `grasp-equery` to greatly simplify your code.

```js
var query = require('grasp-equery').query;
/**
 * @param {Object} ast an esprima-style AST
 * @see An example of AST http://esprima.org/demo/parse.html?code=%27%27.trim()
 * @see Mozilla Parser API https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
 * @see JavaScript AST Parser http://esprima.org/
 * 
 * @returns {String[]} array of polyfills name(s) or emply array
 */
function matcher(ast) {
     return query('_$.trim()', ast).length > 0 ? ['String.prototype.trim'] : [];
}
```

### 4. Write a conditional wrapper

If condition for your polyfill is complex, you can write a wrapper.

```js
/* BEFORE PART */if (!String.prototype.trim) {
                     // There will be your polyfill's code
/* AFTER  PART */} 
```
