var astQuery = require('grasp-equery').query;

exports.name = 'Math.log2';
exports.test = function (ast) {
    return astQuery('Math.log2(_$)', ast).length > 0;
};
