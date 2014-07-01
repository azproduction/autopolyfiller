var scanner = require('../scanner-factory');

var matchers = [
    require('./constructor'),
    require('./method'),
    require('./static'),
    require('./global')
].map(function (matcher) {
    return {
        test: scanner(matcher)
    };
});

module.exports = matchers;
