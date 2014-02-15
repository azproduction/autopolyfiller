var astQuery = require('grasp-equery').query;

exports.name = 'Math.cosh';
exports.test = function (ast) {
    return astQuery('Math.cosh(_$)', ast).length > 0;
};
