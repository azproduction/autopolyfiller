var extend = require('node.extend');
var debug = require('debug')('polyfill:code');

var polyfillsCode = {};

/**
 * Returns crossbrowser polyfill code
 *
 * @param {string} polyfillName
 * @returns {string}
 */
function code(polyfillName) {
    debug('getting polyfill code for `%s`', polyfillName);
    var polyfillCode = polyfillsCode[polyfillName];

    if (!polyfillCode) {
        throw new Error('Unknown feature: ' + polyfillName);
    }

    return polyfillCode;
}

/**
 * Adds polyfills code
 *
 * @param {object} newPolyfills
 */
function addSource(newPolyfills) {
    debug('adding custom polyfill');
    extend(polyfillsCode, newPolyfills);
}

module.exports = code;
module.exports.addSource = addSource;
