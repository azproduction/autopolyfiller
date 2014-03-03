var debug = require('debug')('polyfill:wrap');

/**
 * Wraps code with conditional expression
 *
 * @param {string} code
 * @param {string} polyfillName
 * @returns {string}
 */
function wrap(code, polyfillName) {
    debug('wrapping code of `%s`', polyfillName);
    var parts = polyfillName.split('.'),
        expression = 'true';

    if (parts.length === 1) {
        // Promise
        // typeof Promise === "undefined"
        expression = 'typeof ' + parts[0] + ' === "undefined"';
    } else if (parts.length === 2) {
        // Object.keys
        // typeof Object === "undefined" || Object && !Object.keys
        expression = 'typeof ' + parts[0] + ' === "undefined" || ' + parts[0] + ' && !' + parts[0] + '.' + parts[1];
    } else {
        // Array.prototype.map
        // !Array.prototype.map
        expression = '!' + polyfillName;
    }

    debug('got `%s` condition expression for `%s`', expression, polyfillName);
    return 'if (' + expression + ') {\n' + code + '\n}\n';
}

module.exports = wrap;
