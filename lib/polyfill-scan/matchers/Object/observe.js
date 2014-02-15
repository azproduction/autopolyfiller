var astQuery = require('grasp-equery').query;

exports.name = 'Object.observe';
exports.test = function (ast) {
    return astQuery('Object.observe(_$)', ast).length > 0;
};
