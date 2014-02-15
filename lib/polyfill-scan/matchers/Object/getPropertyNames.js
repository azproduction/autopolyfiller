var astQuery = require('grasp-equery').query;

exports.name = 'Object.getPropertyNames';
exports.test = function (ast) {
    return astQuery('Object.getPropertyNames(_$)', ast).length > 0;
};
