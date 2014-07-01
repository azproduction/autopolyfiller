var scannerFactory = require('../scanner-factory');

var matchers = [
    require('./constructor'),
    require('./method'),
    require('./static'),
    require('./global')
].map(scannerFactory);

module.exports = matchers;
