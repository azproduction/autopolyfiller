var foldExpression = require('../polyfill-expression-fold');
var grepExpressions = require('./grep-expression');

/**
 * Matcher scanner factory
 *
 * @example
 *
 * exports.test = scannerCreate(function (polyfills, list) {
 *      var polyfill = globalFunctions[testMethod(list.join('.'))];
 *
 *      if (polyfill) {
 *          polyfills.push(polyfill);
 *      }
 *
 *      return polyfills;
 * });
 *
 * @param {Object} reducer
 * @returns {Function} function(polyfills, list)
 */
module.exports = function (reducer) {
    /**
     * @param {Object} ast
     * @returns {String[]} list of polyfills in this ast
     */
    return function (ast) {
        return grepExpressions(ast).map(foldExpression).reduce(reducer, []);
    };
};
