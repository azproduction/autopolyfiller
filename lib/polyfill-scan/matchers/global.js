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
 * @param {String[]} polyfills list of available polyfills
 * @param {String[]} expressionList
 * @returns {String[]}
 */
module.exports = function (polyfills, expressionList) {
    var polyfill = globalFunctions[testMethod(expressionList.join('.'))];

    if (polyfill) {
        polyfills.push(polyfill);
    }

    return polyfills;
};
