var astQuery = require('grasp-equery').query;

exports.name = 'Math.expm1';
exports.test = function (ast) {
    return astQuery('Math.expm1(_$)', ast).length > 0;
};
