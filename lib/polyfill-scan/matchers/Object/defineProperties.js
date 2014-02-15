var astQuery = require('grasp-equery').query;

exports.name = 'Object.defineProperties';
exports.test = function (ast) {
    return astQuery('Object.defineProperties(_$)', ast).length > 0;
};
