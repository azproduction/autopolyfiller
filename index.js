var acorn = require('acorn');
var assert = require('assert');
var scan = require('./lib/polyfill-scan');
var reduce = require('./lib/polyfill-reduce');
var wrap = require('./lib/polyfill-wrap');
var minimatch = require('minimatch');
var code = require('./lib/polyfill-code');
var stablePolyfills = require('autopolyfiller-stable');
var polyfillNames = Object.keys(stablePolyfills.polyfill);

/**
 *
 * @param {Object}   options
 * @param {String[]} [options.browsers] Autoprefixer style list of browsers
 * @constructor
 *
 * @example
 *
 * new AutoPolyFiller({
 *     browsers: ['IE 11', 'Chrome >= 31']
 * })
 * .withParser(require('esprima-fb'))
 * .exclude(['Object.create'])
 * .include(['Array.prototype.map'])
 * .add('"".trim();Object.create();new Promise();')
 * .polyfills;
 * // ['Promise', 'Array.prototype.map']
 */
function AutoPolyFiller(options) {
    this.browsers = options.browsers;
    this.polyfills = [];
    this.excluedPolyfills = [];
    this.parserOptions = void 0;
    this.parser = acorn;
}

AutoPolyFiller.prototype = {
    /**
     * Scans `code` for polyfills
     *
     * @param {String} code
     * @returns {String[]}
     * @private
     */
    _scan: function (code) {
        var polyfills = scan(code, this.parser, this.parserOptions);

        // Do not reduce if no browsers
        if (this.browsers && this.browsers.length === 0) {
            return polyfills;
        }
        return reduce(polyfills, this.browsers);
    },

    /**
     * Scans for polyfills in code of each polyfills
     *
     * @param {String[]} polyfills list of polyfills names
     * @returns {String[]} list contains non unique polyfills
     * @private
     */
    _scanForPolyfillsOfPolyfills: function (polyfills) {
        var hasIterated = {};

        var iteratePolyfills = function (polyfills, polyfillName) {
            // Already scanned this polyfill
            if (hasIterated.hasOwnProperty(polyfillName)) {
                return polyfills;
            }
            hasIterated[polyfillName] = true;

            polyfills = polyfills.concat(this._scan(code(polyfillName)));

            return polyfills.concat(polyfills.reduce(iteratePolyfills, []));
        }.bind(this);

        return polyfills.reduce(iteratePolyfills, []);
    },

    /**
     * Inspects given `code` for polyfills
     * @param {String} code javascipt code
     * @returns {AutoPolyFiller}
     */
    add: function (code) {
        var polyfills = this._scan(code);
        var polyfillsOfPolyfills = this._scanForPolyfillsOfPolyfills(polyfills);

        this.include(polyfills.concat(polyfillsOfPolyfills));

        return this;
    },

    /**
     *
     * @returns {string} code that polyfills all listed functions
     */
    toString: function () {
        return this.polyfills.map(function (polyfillName) {
            var polyfillCode = code(polyfillName);
            return wrap(polyfillCode, polyfillName);
        }).join('');
    },

    /**
     * Checks if `polyfill` is not in a `excluedPolyfills` list
     *
     * @param {String} polyfill
     * @returns {Boolean}
     * @private
     */
    _isPolyfillIncluded: function (polyfill) {
        return this.excluedPolyfills.indexOf(polyfill) === -1;
    },

    /**
     * Adds `polyfills` to the list of required polyfills
     *
     * @param {String[]} polyfills
     * @returns {AutoPolyFiller}
     */
    include: function (polyfills) {
        this.polyfills = this.polyfills
            .concat(polyfills)

            // If any of the patterns contain '*', add all of the matching
            // polyfills
            .reduce(function (polyfills, polyfill) {
                if (polyfill.indexOf('*') > -1) {
                    var matches = polyfillNames.filter(function (name) {
                        return minimatch(name, polyfill);
                    });
                    return polyfills.concat(matches);
                }
                polyfills.push(polyfill);

                return polyfills;
            }, [])

            // Filter ignored polyfills
            .filter(this._isPolyfillIncluded.bind(this))

            // Make unique polyfills
            .reduce(function (polyfills, polyfill) {
                if (polyfills.indexOf(polyfill) === -1) {
                    polyfills.push(polyfill);
                }

                return polyfills;
            }, []);

        return this;
    },

    /**
     * Ignores `polyfills`, excluded their code from result
     *
     * @param {String[]} polyfills
     * @returns {AutoPolyFiller}
     */
    exclude: function (polyfills) {
        this.excluedPolyfills.push.apply(this.excluedPolyfills, polyfills);

        // Filter ignored polyfills
        this.polyfills = this.polyfills
            .filter(this._isPolyfillIncluded.bind(this));

        return this;
    },

    /**
     * Overrides default parser
     *
     * @param {Object} parser
     * @param {Object} parser.parse
     * @param {Object} [parserOptions]
     * @returns {AutoPolyFiller}
     */
    withParser: function (parser, parserOptions) {
        this.parserOptions = parserOptions;

        if (parser) {
            assert(typeof parser.parse === 'function', 'parser should have a `parse` method');
            this.parser = parser;
        }

        return this;
    }
};

/**
 * Polyfill interface
 *
 * @example
 *
 * polyfiller('IE 11', 'Chrome >= 31')
 * .add('"".trim();Object.create();new Promise()')
 * .polyfills;
 * // ['Promise']
 */
function create() {
    var browsers = arguments.length >= 1 ? [].slice.call(arguments, 0) : [];

    if (browsers.length === 1 && browsers[0] instanceof Array) {
        browsers = browsers[0];
    }

    return new AutoPolyFiller({
        browsers: browsers
    });
}

/**
 * Customizes polyfills
 *
 * @param {Object}   options
 * @param {Function} [options.test]
 * @param {Object}   [options.support]
 * @param {Object}   [options.polyfill]
 * @param {Object}   [options.wrapper]
 */
function use(options) {
    if (options.test) {
        scan.use({
            test: options.test
        });
    }

    if (options.support) {
        reduce.support(options.support);
    }

    if (options.polyfill) {
        code.addSource(options.polyfill);
    }

    if (options.wrapper) {
        wrap.addWrapper(options.wrapper);
    }
}

use(stablePolyfills);

module.exports = create;
module.exports.use = use;
