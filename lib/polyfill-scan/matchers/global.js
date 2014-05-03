var foldExpression = require('../../polyfill-expression-fold');
var grepExpressions = require('../grep-expression');
var matcher = require('../../polyfill-expression-matcher');

var globalFunctions = {
    // 'requestAnimationFrame': 'Window.prototype.requestAnimationFrame',
    // 'cancelAnimationFrame': 'Window.prototype.requestAnimationFrame',
    'btoa': 'Window.prototype.base64',
    'atob': 'Window.prototype.base64',
    'matchMedia': 'Window.prototype.matchMedia'
};

/**
 * @type {Function}
 */
var testMethod = matcher('global', {
    methods: Object.keys(globalFunctions)
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
            var polyfill = globalFunctions[testMethod(list.join('.'))];

            if (polyfill) {
                polyfills.push(polyfill);
            }

            return polyfills;
        }, []);
};
