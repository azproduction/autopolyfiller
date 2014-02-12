module.exports = ['es5', 'es6'].reduce(function (buffer, esVersion) {
    var browsers = require(__dirname + '/../data/data-' + esVersion + '.js').browsers;

    Object.keys(browsers).forEach(function (name) {
        buffer[name] = browsers[name];
    });

    return buffer;
}, {});
