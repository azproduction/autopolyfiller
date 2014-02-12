module.exports = process.env.POLYFILL_LOOKUP_COVERAGE ?
    require('./lib-cov') :
    require('./lib');
