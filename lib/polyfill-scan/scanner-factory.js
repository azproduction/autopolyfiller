var foldExpression = require('../polyfill-expression-fold');
var grepExpressions = require('./grep-expression');

/**
 * Matcher scanner factory
 *
 * @example
 *
 * exports.test = scannerCreate({
 *     polyfills: {
 *         'Promise': 'Promise'
 *     },
 *     tester: function (code) {
 *         return /Promise/.test(code) ? 'Promise' : void 0;
 *     }
 * });
 *
 * @param {Object}   options
 * @param {Object}   options.polyfills
 * @param {Function} options.tester
 * @returns {Object}
 */
module.exports = function (options) {
    /**
     * @param {Object} ast
     * @returns {String[]} list of polyfills in this ast
     */
    var test = function (ast) {
        return grepExpressions(ast).map(foldExpression).reduce(function (polyfills, expressionList) {
            var polyfill = options.polyfills[options.tester(expressionList.join('.'))];

            if (polyfill) {
                polyfills.push(polyfill);
            }

            return polyfills;
        }, []);
    };

    return {
        test: test
    };
};
