var astQuery = require('grasp-equery').query;

exports.name = 'Proxy';
exports.test = function (ast) {
    return astQuery('new Proxy(_$)', ast).length > 0;
};
