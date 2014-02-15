var astQuery = require('grasp-equery').query;

exports.name = 'Math.acosh';
exports.test = function (ast) {
    return astQuery('Math.acosh(_$)', ast).length > 0;
};
