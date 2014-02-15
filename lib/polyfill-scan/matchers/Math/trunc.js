var astQuery = require('grasp-equery').query;

exports.name = 'Math.trunc';
exports.test = function (ast) {
    return astQuery('Math.trunc(_$)', ast).length > 0;
};
