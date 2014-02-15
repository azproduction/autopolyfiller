var astQuery = require('grasp-equery').query;

exports.name = 'Object.seal';
exports.test = function (ast) {
    return astQuery('Object.seal(_$)', ast).length > 0;
};
