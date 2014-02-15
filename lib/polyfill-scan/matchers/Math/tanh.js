var astQuery = require('grasp-equery').query;

exports.name = 'Math.tanh';
exports.test = function (ast) {
    return astQuery('Math.tanh(_$)', ast).length > 0;
};
