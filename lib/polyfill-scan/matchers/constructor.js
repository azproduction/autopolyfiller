var foldExpression = require('../../polyfill-expression-fold');
var grepExpressions = require('../grep-expression');
var matcher = require('../../polyfill-expression-matcher');

var constructors = {
    'WeakMap': 'WeakMap',
    'Symbol': 'Symbol',
    'Set': 'Set',
    'Proxy': 'Proxy',
    'Promise': 'Promise',
    'Map': 'Map'
};

/**
 * @type {Function}
 */
var testConstructor = matcher('constructor', {
    constructors: Object.keys(constructors)
});

/**
 *
 * @param {Object} ast
 * @returns {String[]} list of polyfills in this ast
 */
exports.test = function (ast) {
    return grepExpressions(ast)
        .map(foldExpression)
        .reduce(function (polyfills, list) {
            var polyfill = constructors[testConstructor(list.join('.'))];

            if (polyfill) {
                polyfills.push(polyfill);
            }

            return polyfills;
        }, []);
};
