var astQuery = require('grasp-equery').query;

exports.name = 'Object.getOwnPropertyDescriptor';
exports.test = function (ast) {
    return astQuery('Object.getOwnPropertyDescriptor(_$)', ast).length > 0;
};
