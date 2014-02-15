var astQuery = require('grasp-equery').query;

exports.name = 'Object.getOwnPropertyNames';
exports.test = function (ast) {
    return astQuery('Object.getOwnPropertyNames(_$)', ast).length > 0;
};
