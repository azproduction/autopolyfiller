var astQuery = require('grasp-equery').query;

exports.name = 'Object.keys';
exports.test = function (ast) {
    return astQuery('Object.keys(_$)', ast).length > 0;
};
