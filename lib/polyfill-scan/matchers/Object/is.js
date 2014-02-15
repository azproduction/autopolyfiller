var astQuery = require('grasp-equery').query;

exports.name = 'Object.is';
exports.test = function (ast) {
    return astQuery('Object.is(_$)', ast).length > 0;
};
