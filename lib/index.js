var scan = require('./polyfill-scan'),
    reduce = require('./polyfill-reduce');

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
    options = options || {};

    this.code = '';
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
        this.code = this.code + code;
        this.polyfills = this.polyfills
            .concat(this._scan(code))
            .reduce(function (polyfills, polyfill) {
                if (polyfills.indexOf(polyfill) === -1) {
                    polyfills.push(polyfill);
                }
                return polyfills;
            }, []);

        return this;
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

module.exports.use = function (config) {
    scan.use({
        test: config.test
    });

    reduce.support(config.support);
};
