var Browsers = require('autoprefixer/lib/browsers'),
    browsersData = require('autoprefixer/data/browsers'),
    debug = require('debug')('polyfill:reduce'),
    polyfill = require('polyfill');

var polyFillSets = polyfill.agent.js;

// Autoprefixer browser code to polyfill agent name
var browserMap = {
//    0: 'Opera Mini',
//    1: 'Opera Mobile',
    'opera': 'Opera',
    'android': 'Android',
    'bb': 'BlackBerry',
//    '-': 'Chrome iOS',
    'ios': 'Safari iOS',
    'chrome': 'Chrome',
    'ie': 'Internet Explorer',
    'ff': 'Firefox',
    'safari': 'Safari'
};

var reBrowserAndVersion = /^(\w+) ([\d\.]+)$/;

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
            (range.only && range.only === version) ||
            // X >= A
            (range.min && !range.max && version >= range.min) ||
            // A <= X <= B
            (range.min && range.max && version >= range.min && version <= range.max) ||
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

// Extra polyfills
support(require('./data/index.json'));

module.exports = reduce;
module.exports.support = support;
module.exports.list = list;
