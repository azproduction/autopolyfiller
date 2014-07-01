var scanner = require('../scanner-factory');
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

exports.test = scanner(function (polyfills, list) {
    var polyfill = globalFunctions[testMethod(list.join('.'))];

    if (polyfill) {
        polyfills.push(polyfill);
    }

    return polyfills;
});
