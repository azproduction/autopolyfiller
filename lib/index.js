/*!
 * autopolyfiller
 */
'use strict';

var parse = require('acorn').parse;
var browsers = require('./browsers');
var matchers = [];

/**
 *
 * @param {Object}   matcher
 * @param {Function} matcher.test
 * @param {String}   matcher.name
 * @param {Object}   matcher.support set of browsers
 */
function use(matcher) {
    matchers.push(matcher);
    return this;
}

require('./matchers').forEach(use);

/**
 *
 * @param {String} code
 * @constructor
 */
function PolyFillLookup(code) {
    this.code = code;
}

PolyFillLookup.prototype = {
    /**
     *
     * @param {String} [browsers]
     * @returns {Array} list of polyfills
     */
    find: function (browsers) {
        browsers = browsers || '';
        var ast = parse(this.code);

        function hasPattern(matcher) {
            return matcher.test(ast);
        }

        return matchers.filter(hasPattern).map(function (matcher) {
            return matcher.name;
        });
    }
};

module.exports = PolyFillLookup;
module.exports.use = use;
