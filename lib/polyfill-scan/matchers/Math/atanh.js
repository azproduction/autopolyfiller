var astQuery = require('grasp-equery').query;

exports.name = 'Math.atanh';
exports.test = function (ast) {
    return astQuery('Math.atanh(_$)', ast).length > 0;
};
