var astQuery = require('grasp-equery').query;

exports.name = 'Object.setPrototypeOf';
exports.test = function (ast) {
    return astQuery('Object.setPrototypeOf(_$)', ast).length > 0;
};
