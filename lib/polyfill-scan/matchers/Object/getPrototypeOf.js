var astQuery = require('grasp-equery').query;

exports.name = 'Object.getPrototypeOf';
exports.test = function (ast) {
    return astQuery('Object.getPrototypeOf(_$)', ast).length > 0;
};
