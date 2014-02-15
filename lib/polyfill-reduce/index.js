var Browsers = require('autoprefixer/lib/browsers'),
    browsersData = require('autoprefixer/data/browsers'),
    supportData = require(__dirname + '/data'),
    debug = require('debug')('polyfill-reduce');

/**
 *
 * @param {String[]} polyfills        List of polyfill names from polyfill-scan
 * @param {String[]} browsersRequest  Autoprefixer-style list of browsers or versions
 *
 * @returns {String[]} reduced list of polyfills
 *
 * @example
 *
 * reduce(['JSON.parse'], ['Explorer 10', '> 5%'])
 * // []
 */
function reduce(polyfills, browsersRequest) {
    var browsers = new Browsers(browsersData, browsersRequest).selected;
    debug('%s are selected', browsers);

    return polyfills.filter(function (polyfill) {
        var support = supportData[polyfill],
            shouldPolyFill = false;

        // Not listed
        if (!support) {
            debug('%s is not listed', polyfill);
            shouldPolyFill = true;
        }

        shouldPolyFill = shouldPolyFill || browsers.some(function (browser) {
            return !support[browser];
        });

        debug((shouldPolyFill ? 'keeping  ' : 'removing ') + polyfill);
        return shouldPolyFill;
    });
}

module.exports = reduce;
