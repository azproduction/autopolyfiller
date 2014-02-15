var astQuery = require('grasp-equery').query;

exports.name = 'Object.preventExtensions';
exports.test = function (ast) {
    return astQuery('Object.preventExtensions(_$)', ast).length > 0;
};
