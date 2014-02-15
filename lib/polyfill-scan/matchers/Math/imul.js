var astQuery = require('grasp-equery').query;

exports.name = 'Math.imul';
exports.test = function (ast) {
    return astQuery('Math.imul(_$)', ast).length > 0;
};
