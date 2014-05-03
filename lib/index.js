var scan = require('./polyfill-scan'),
    reduce = require('./polyfill-reduce'),
    wrap = require('./polyfill-wrap'),
    code = require('./polyfill-code');

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
        var polyfills = scan(code);

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
        var polyfills = this._scan(code),
            polyfillsOfPolyfills = this._scanForPolyfillsOfPolyfills(polyfills);

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
module.exports = function () {
    var browsers = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];

    if (browsers.length === 1 && browsers[0] instanceof Array) {
        browsers = browsers[0];
    }

    return new AutoPolyFiller({
        browsers: browsers
    });
};

/**
 * Customizes polyfills
 *
 * @param {Object}   config
 * @param {Function} [config.test]
 * @param {Object}   [config.support]
 * @param {Object}   [config.polyfill]
 * @param {Object}   [config.wrapper]
 */
module.exports.use = function (config) {
    if (config.test) {
        scan.use({
            test: config.test
        });
    }

    if (config.support) {
        reduce.support(config.support);
    }

    if (config.polyfill) {
        code.addSource(config.polyfill);
    }

    if (config.wrapper) {
        wrap.addWrapper(config.wrapper);
    }
};
