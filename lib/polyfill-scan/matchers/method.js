var foldExpression = require('../../polyfill-expression-fold');
var grepExpressions = require('../grep-expression');
var matcher = require('../../polyfill-expression-matcher');

var methods = {
    // Array
    'every': 'Array.prototype.every',
    'fill': 'Array.prototype.fill',
    'filter': 'Array.prototype.filter',
    'find': 'Array.prototype.find',
    'findIndex': 'Array.prototype.findIndex',
    'forEach': 'Array.prototype.forEach',
    'indexOf': 'Array.prototype.indexOf',
    'lastIndexOf': 'Array.prototype.lastIndexOf',
    'map': 'Array.prototype.map',
    'reduce': 'Array.prototype.reduce',
    'reduceRight': 'Array.prototype.reduceRight',
    'some': 'Array.prototype.some',

    // Date
    'toISOString': 'Date.prototype.toISOString',

    // Function
    'bind': 'Function.prototype.bind',

    // Number
    'clz': 'Number.prototype.clz',

    // String
    'codePointAt': 'String.prototype.codePointAt',
    'contains': 'String.prototype.contains',
    'endsWith': 'String.prototype.endsWith',
    'repeat': 'String.prototype.repeat',
    'startsWith': 'String.prototype.startsWith',
    'toArray': 'String.prototype.toArray',
    'trim': 'String.prototype.trim'
};

/**
 * @type {Function}
 */
var testMethod = matcher('method', {
    methods: Object.keys(methods)
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
            var polyfill = methods[testMethod(list.join('.'))];

            if (polyfill) {
                polyfills.push(polyfill);
            }

            return polyfills;
        }, []);
};
