var scanner = require('../scanner-factory');
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

exports.test = scanner(function (polyfills, list) {
    var polyfill = constructors[testConstructor(list.join('.'))];

    if (polyfill) {
        polyfills.push(polyfill);
    }

    return polyfills;
});
