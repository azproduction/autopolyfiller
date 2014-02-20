# Polyfill matchers

## Example

```js
var query = require('grasp-equery').query;

/**
 * @param {Object} ast
 * @returns {String[]}
 */
exports.test = function (ast) {
    return query('Object.create(_$)', ast).length ? ['Object.create'] : [];
};
```
