/*!
 * polyfill-scan
 */
var parse = require('acorn').parse,
    glob = require('glob').sync,
    debug = require('debug')('polyfill-scan');

debug('loading matchers');
var matchers = glob(__dirname + '/matchers/**/*.js').map(require);
debug('%d matchers are loaded', matchers.length);

/**
 *
 * @param {Object}   matcher
 * @param {String}   matcher.name
 * @param {Function} matcher.test
 */
function use(matcher) {
    debug('adding custom matcher %s', (matcher && matcher.name));
    matchers.push(matcher);
}

/**
 * @param {String} code
 * @returns {Array} list of polyfills
 */
function scan(code) {
    debug('parsing code');
    var ast = parse(code);
    debug('parsing done');

    debug('scanning for polyfills using %d matchers', matchers.length);
    var polyfills = matchers
        .filter(function (matcher) {
            return matcher.test(ast);
        })
        .map(function (matcher) {
            return matcher.name;
        });
    debug('got %d polyfill(s)', polyfills.length);

    return polyfills;
}

module.exports = scan;
module.exports.use = use;
