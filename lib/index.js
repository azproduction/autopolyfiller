var scan = require('./polyfill-scan'),
    reduce = require('./polyfill-reduce'),
    polyfill = require('polyfill'),
    extend = require('node.extend');

/**
 *
 * @param {Object}   options
 * @param {String}   [options.code]
 * @param {String[]} [options.browsers] Autoprefixer style list of browsers
 *
 * @example
 *
 * new AutoPolyFiller({
 *     browsers: ['IE 11', 'Chrome >= 31']
 * })
 * .add('"".trim();Object.create();new Promise()')
 * .polyfills;
 * // ['Promise']
 */
function AutoPolyFiller(options) {
    this.browsers = options.browsers;
    this.polyfills = [];
}

AutoPolyFiller.prototype = {
    /**
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
     *
     * @param {String} code
     * @returns {AutoPolyFiller}
     */
    add: function (code) {
        this.polyfills = this.polyfills
            .concat(this._scan(code))
            .reduce(function (polyfills, polyfill) {
                if (polyfills.indexOf(polyfill) === -1) {
                    polyfills.push(polyfill);
                }
                return polyfills;
            }, []);

        return this;
    },

    /**
     *
     * @returns {string} code that polyfills all listed functions
     */
    toString: function () {
        return this.polyfills.map(function (polyfillName) {
            var code = polyfill.source[polyfillName];

            if (!code) {
                throw new Error('Unknown feature: ' + polyfillName);
            }

            return code;
        }).join('\n');
    }
};

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
 *
 * @param {Object}   config
 * @param {Function} [config.test]
 * @param {Object}   [config.support]
 * @param {Object}   [config.polyfill]
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
        extend(polyfill.source, config.polyfill);
    }
};
