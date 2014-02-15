var astQuery = require('grasp-equery').query;

exports.name = 'Object.isFrozen';
exports.test = function (ast) {
    return astQuery('Object.isFrozen(_$)', ast).length > 0;
};
