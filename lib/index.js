/*!
 * autopolyfiller
 */
'use strict';

var parse = require('acorn').parse,
    translate = require('./browser-translate'),
    esBrowsersData = require('./browsers'),
    autoprefixerBrowsersData = require('autoprefixer/data/browsers'),
    Browsers = require('autoprefixer/lib/browsers');

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
     * @param {String[]} [browsers] list of autoprefixer-style rules
     * @returns {Array} list of polyfills
     */
    find: function (browsers) {
        var ast = parse(this.code);

        function hasPattern(matcher) {
            return matcher.test(ast);
        }

        return matchers.filter(hasPattern)
            .filter(this._filtrate(browsers))
            .map(function (matcher) {
                return matcher.name;
            });
    },

    /**
     *
     * @param {String[]} browsers
     * @private
     *
     * @returns {Function}
     */
    _filtrate: function (browsers) {
        if (!browsers || !browsers.length) {
            return function () {
                return true;
            };
        }

        var selected = new Browsers(autoprefixerBrowsersData, browsers).selected
            .reduce(function (selected, browser) {
                return selected.concat(translate(browser));
            }, []);

        return function (matcher) {
            // if one of selected browsers does not support this feature return true
            return selected.some(function (browserName) {
                return !matcher.support[browserName];
            });
        };
    }
};

module.exports = PolyFillLookup;
module.exports.use = use;
