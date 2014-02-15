module.exports = process.env.AUTOPOLIFILLER_COVERAGE ?
    require('./lib-cov') :
    require('./lib');
