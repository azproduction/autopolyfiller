var browsersNames = Object.keys(require('./browsers')).sort();

var table = {
    'chrome': 'chrome',
    'ff': 'firefox',
    'ie': 'ie',
    'opera': 'opera',
    'safari': 'safari'
};

var reBrowserAndVersion = /^(\w+) ([\d\.]+)$/;

/**
 *
 * @param {String} autoprefixerName
 * @returns {Array} ES compat table names
 */
function translate(autoprefixerName) {
    var parts = autoprefixerName.match(reBrowserAndVersion),
        browser = table[parts[1]],
        version = parts[2];

    // Fix
    if (browser === 'ie' && version === '11') {
        version = '10';
    }

    var joinedVersion = version.replace('.',''),
        underscoredVersion = version.replace('.', '_');

    return browsersNames
        .filter(function (browsersName) {
            return browsersName.indexOf(browser) === 0;
        })
        .filter(function (browsersName) {
                   // case safari51
            return browsersName.indexOf(browser + joinedVersion) === 0 ||
                   // case firefox3_5
                   browsersName.indexOf(browser + underscoredVersion) === 0;
        });
}

module.exports = translate;
