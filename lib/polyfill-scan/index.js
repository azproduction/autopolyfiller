/*!
 * polyfill-scan
 */
var parse = require('acorn').parse,
    debug = require('debug')('polyfill:scan');

debug('loading matchers');
var matchers = require('./matchers');
debug('%d matchers are loaded', matchers.length);

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
 * @returns {String[]} list of polyfills
 */
function scan(code) {
    debug('parsing code');
    var ast = parse(code);
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
