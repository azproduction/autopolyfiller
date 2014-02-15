var astQuery = require('grasp-equery').query;

exports.name = 'Math.fround';
exports.test = function (ast) {
    return astQuery('Math.fround(_$)', ast).length > 0;
};
