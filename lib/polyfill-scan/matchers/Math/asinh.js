var astQuery = require('grasp-equery').query;

exports.name = 'Math.asinh';
exports.test = function (ast) {
    return astQuery('Math.asinh(_$)', ast).length > 0;
};
