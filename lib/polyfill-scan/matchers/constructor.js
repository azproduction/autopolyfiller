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

/**
 *
 * @param {String[]} polyfills list of available polyfills
 * @param {String[]} expressionList
 * @returns {String[]}
 */
module.exports = function (polyfills, expressionList) {
    var polyfill = constructors[testConstructor(expressionList.join('.'))];

    if (polyfill) {
        polyfills.push(polyfill);
    }

    return polyfills;
};
