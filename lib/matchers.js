var glob = require('glob').sync,
    query = require('grasp-equery').query;

// Special Matches
var matchers = glob(__dirname + '/../matchers/**/*.js')
    .map(require);

/**
 *
 * @param {String} name test name
 * @returns Function
 */
function createTest(name) {
    var queryString = /prototype\./.test(name) ?
        '__.' + name.split('prototype.')[1] + '(_$)' :
        name + '(_$)';

    if (name === 'JSON') {
        queryString = 'JSON.__(_$)';
    }

    if (/(Symbol|Map|Set|WeakMap|Proxy|Promise)/.test(name)) {
        queryString = 'new ' + name + '(_$)';
    }

    return function (ast) {
        return query(queryString, ast).length > 0;
    };
}

var reAvailableTests = new RegExp('^(' +
    'Object|Array\\.|Date|Function|String|Number|' +
    'Math|JSON|' +
    'Symbol|Map|Set|WeakMap|Proxy|Promise)');

// ES5-ES6 Matchers
var esMatchers = []
    .concat(require(__dirname + '/../data/data-es5.js').tests)
    .concat(require(__dirname + '/../data/data-es6.js').tests)
    .filter(function (test) {
        return reAvailableTests.test(test.name);
    })
    .map(function (test) {
        var name = test.name.split(' ')[0];

        return {
            name: name,
            test: createTest(name),
            support: test.res
        };
    });

module.exports = matchers.concat(esMatchers);
