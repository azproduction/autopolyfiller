var astQuery = require('grasp-equery').query;

exports.name = 'Array.of';
exports.test = function (ast) {
    return astQuery('Array.of(_$)', ast).length > 0;
};
