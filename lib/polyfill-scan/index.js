/*!
 * polyfill-scan
 */
var acorn = require('acorn');
var debug = require('debug')('polyfill:scan');

var matchers = [];

/**
 *
 * @param {Object}   matcher
 * @param {Function} matcher.test
 */
function use(matcher) {
    debug('adding custom matcher');
    matchers.push(matcher);
}

/**
 * @param {String} code
 * @param {Object} [parser]
 * @param {Function} parser.parse
 * @param {Object} [parserOptions]
 * @returns {String[]} list of polyfills
 */
function scan(code, parser, parserOptions) {
    parser = parser || acorn;
    debug('parsing code');
    var ast = parser.parse(code, parserOptions);
    debug('parsing done');

    debug('scanning for polyfills using %d matchers', matchers.length);
    var polyfills = matchers
        .reduce(function (polyfills, matcher) {
            return polyfills.concat(matcher.test(ast));
        }, [])
        // Unique
        .reduce(function (polyfills, polyfill) {
            if (polyfills.indexOf(polyfill) === -1) {
                polyfills.push(polyfill);
            }
            return polyfills;
        }, []);
    debug('got %d polyfill(s)', polyfills.length);

    return polyfills;
}

module.exports = scan;
module.exports.use = use;
