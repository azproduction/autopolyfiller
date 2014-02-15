var astQuery = require('grasp-equery').query;

exports.name = 'Object.defineProperty';
exports.test = function (ast) {
    return astQuery('Object.defineProperty(_$)', ast).length > 0;
};
