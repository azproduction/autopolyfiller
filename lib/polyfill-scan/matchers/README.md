# Special matchers

## Example

```js
var query = require('grasp-equery').query.query;

exports.name = 'Object.create';
exports.test = function (ast) {
    return query('Object.create(_$)', ast).length > 0;
};
exports.support = {
    'ie7': false
};
```