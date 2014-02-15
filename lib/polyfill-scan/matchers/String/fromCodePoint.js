var astQuery = require('grasp-equery').query;

exports.name = 'String.fromCodePoint';
exports.test = function (ast) {
    return astQuery('String.fromCodePoint(_$)', ast).length > 0;
};
