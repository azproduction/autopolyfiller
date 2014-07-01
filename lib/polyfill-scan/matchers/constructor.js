var matcher = require('../../polyfill-expression-matcher');

var constructors = {
    // 'WeakMap': 'WeakMap',
    // 'Symbol': 'Symbol',
    // 'Set': 'Set',
    // 'Proxy': 'Proxy',
    // 'Map': 'Map',
    'Promise': 'Promise'
};

/**
 * @type {Function}
 */
var testConstructor = matcher('constructor', {
    constructors: Object.keys(constructors)
});

module.exports = {
    polyfills: constructors,
    tester: testConstructor
};
