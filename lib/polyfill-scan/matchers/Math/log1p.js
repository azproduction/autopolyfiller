var astQuery = require('grasp-equery').query;

exports.name = 'Math.log1p';
exports.test = function (ast) {
    return astQuery('Math.log1p(_$)', ast).length > 0;
};
