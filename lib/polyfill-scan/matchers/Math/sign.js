var astQuery = require('grasp-equery').query;

exports.name = 'Math.sign';
exports.test = function (ast) {
    return astQuery('Math.sign(_$)', ast).length > 0;
};
