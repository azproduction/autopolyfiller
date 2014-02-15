var astQuery = require('grasp-equery').query;

exports.name = 'Math.log10';
exports.test = function (ast) {
    return astQuery('Math.log10(_$)', ast).length > 0;
};
