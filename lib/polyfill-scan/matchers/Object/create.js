var astQuery = require('grasp-equery').query;

exports.name = 'Object.create';
exports.test = function (ast) {
    return astQuery('Object.create(_$)', ast).length > 0;
};
