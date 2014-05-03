var foldExpression = require('../../polyfill-expression-fold');
var grepExpressions = require('../grep-expression');
var matcher = require('../../polyfill-expression-matcher');

var statics = {
    'Array': {
        //'from': 'Array.from',
        'of': 'Array.of',
        'isArray': 'Array.isArray'
    },
    'Date': {
        'now': 'Date.now'
    },
    'JSON': {
        'parse': 'Window.prototype.JSON',
        'stringify': 'Window.prototype.JSON'
    },
    // 'Math': {
    //     'acosh': 'Math.acosh',
    //     'asinh': 'Math.asinh',
    //     'atanh': 'Math.atanh',
    //     'cosh': 'Math.cosh',
    //     'expm1': 'Math.expm1',
    //     'fround': 'Math.fround',
    //     'hypot': 'Math.hypot',
    //     'imul': 'Math.imul',
    //     'log10': 'Math.log10',
    //     'log1p': 'Math.log1p',
    //     'log2': 'Math.log2',
    //     'sign': 'Math.sign',
    //     'sinh': 'Math.sinh',
    //     'tanh': 'Math.tanh',
    //     'trunc': 'Math.trunc'
    // },
    // 'Number': {
    //     'isFinite': 'Number.isFinite',
    //     'isInteger': 'Number.isInteger',
    //     'isNaN': 'Number.isNaN',
    //     'toInteger': 'Number.toInteger'
    // },
    'Object': {
        // 'assign': 'Object.assign',
        'create': 'Object.create',
        'defineProperties': 'Object.defineProperties',
        'defineProperty': 'Object.defineProperty',
        // 'freeze': 'Object.freeze',
        // 'getOwnPropertyDescriptor': 'Object.getOwnPropertyDescriptor',
        // 'getOwnPropertyDescriptors': 'Object.getOwnPropertyDescriptors',
        'getOwnPropertyNames': 'Object.getOwnPropertyNames',
        // 'getPropertyDescriptor': 'Object.getPropertyDescriptor',
        // 'getPropertyNames': 'Object.getPropertyNames',
        'getPrototypeOf': 'Object.getPrototypeOf',
        'is': 'Object.is',
        // 'isExtensible': 'Object.isExtensible',
        // 'isFrozen': 'Object.isFrozen',
        // 'isSealed': 'Object.isSealed',
        // 'observe': 'Object.observe',
        // 'preventExtensions': 'Object.preventExtensions',
        // 'seal': 'Object.seal',
        // 'setPrototypeOf': 'Object.setPrototypeOf',
        'keys': 'Object.keys'
    }
};

/**
 * @type {Function}
 */
var testStatic = matcher('static', {
    objects: Object.keys(statics).reduce(function (objects, object) {
        objects[object] = Object.keys(statics[object]);
        return objects;
    }, {})
});

/**
 * @type {Object}
 */
var expressionToPolyfillMap = Object.keys(statics).reduce(function (map, object) {
    return Object.keys(statics[object]).reduce(function (map, method) {
        map[object + '.' + method] = statics[object][method];
        return map;
    }, map);
}, {});

/**
 *
 * @param {Object} ast
 * @returns {String[]} list of polyfills in this ast
 */
exports.test = function (ast) {
    return grepExpressions(ast)
        .map(foldExpression)
        .reduce(function (polyfills, list) {
            var polyfill = expressionToPolyfillMap[testStatic(list.join('.'))];

            if (polyfill) {
                polyfills.push(polyfill);
            }

            return polyfills;
        }, []);
};
