var browserslist = require('browserslist');
var debug = require('debug')('polyfill:reduce');
var semver = require('semver');

var polyFillSets = {};

// Autoprefixer browser code to polyfill agent name
var browserMap = {
    ie: 'Internet Explorer',
    firefox: 'Firefox',
    chrome: 'Chrome',
    safari: 'Safari',
    opera: 'Opera',
    ios_saf: 'Safari iOS',
    android: 'Android'
    /*,'ie_mob': ''*/
};

var reBrowserAndVersion = /^(\w+) ([\d\.]+)$/;

/**
 * 10    -> 10.0.0
 * 11.5  -> 11.5.0
 * 1.1.1 -> 1.1.1
 *
 * @param {string|number} version
 * @returns {string}
 */
function toSemver(version) {
    return String(version).split('.').concat(0, 0, 0).slice(0, 3).join('.');
}

/**
 * @param {string} comparatorName
 * @param {string} a
 * @param {string} b
 * @returns {boolean}
 */
function cmp(comparatorName, a, b) {
    return semver[comparatorName](toSemver(a), toSemver(b));
}

/**
 *
 * @param {String} browserCode
 * @param {String} version
 */
function polyFillsFor(browserCode, version) {
    var polyFillSet = polyFillSets[browserMap[browserCode]];

    if (!polyFillSet) {
        return [];
    }

    return polyFillSet.reduce(function (polyfills, range) {
        var isMatches =
            // X === A
            (range.only && cmp('eq', version, range.only)) ||
            // X >= A
            (range.min && !range.max && cmp('gte', version, range.min)) ||
            // A <= X <= B
            (range.min && range.max && cmp('gte', version, range.min) && cmp('lte', version, range.max)) ||
            // Always
            (!range.min && !range.max && !range.only);

        if (isMatches) {
            return polyfills.concat(range.fill.split(' '));
        }

        return polyfills;
    }, []);
}

/**
 *
 * @param {String[]} polyfills        List of polyfill names from polyfill-scan
 * @param {String[]|String} browsersRequest  Autoprefixer-style list of browsers or versions
 *
 * @returns {String[]} reduced list of polyfills
 *
 * @example
 *
 * reduce(['JSON.parse'], ['Explorer 10', '> 5%'])
 * // []
 */
function reduce(polyfills, browsersRequest) {
    var browsers = browserslist(browsersRequest.toString());
    debug('%s are selected', browsers);

    var requiredPolyFills = browsers
        .reduce(function (requiredPolyFills, browserAndVersion) {
            var parts = browserAndVersion.match(reBrowserAndVersion);

            return requiredPolyFills.concat(polyFillsFor.apply(null, parts.slice(1, 3)));
        }, [])
        // Make unique and cast to hash
        .reduce(function (polyfills, polyfill) {
            polyfills[polyfill] = true;

            return polyfills;
        }, {});

    return polyfills.filter(function (polyfill) {
        var shouldPolyFill = polyfill in requiredPolyFills;
        debug('%s `%s`', (shouldPolyFill ? 'keeping' : 'removing'), polyfill);
        return shouldPolyFill;
    });
}

/**
 * @param {Object} polyfills
 */
function support(polyfills) {
    debug('adding custom supported polyfills');
    Object.keys(polyfills).forEach(function (browser) {
        if (!polyFillSets[browser]) {
            polyFillSets[browser] = [];
        }

        polyFillSets[browser].push.apply(polyFillSets[browser], polyfills[browser]);
    });
}

/**
 * @returns {String[]} list of all available polyfills
 */
function list() {
    return Object.keys(polyFillSets)
        // Collect all available polyfills
        .reduce(function (polyfills, browserName) {
            return polyFillSets[browserName].reduce(function (polyfills, sets) {
                return polyfills.concat(sets.fill.split(' '));
            }, polyfills);
        }, [])
        // Unique
        .reduce(function (polyfills, polyfill) {
            if (polyfills.indexOf(polyfill) === -1) {
                polyfills.push(polyfill);
            }
            return polyfills;
        }, []);
}

module.exports = reduce;
module.exports.support = support;
module.exports.list = list;
