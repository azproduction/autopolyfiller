var astQuery = require('grasp-equery').query;

exports.name = 'Object.getPropertyDescriptor';
exports.test = function (ast) {
    return astQuery('Object.getPropertyDescriptor(_$)', ast).length > 0;
};
