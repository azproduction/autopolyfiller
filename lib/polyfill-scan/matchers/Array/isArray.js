var astQuery = require('grasp-equery').query;

exports.name = 'Array.isArray';
exports.test = function (ast) {
    return astQuery('Array.isArray(_$)', ast).length > 0;
};
