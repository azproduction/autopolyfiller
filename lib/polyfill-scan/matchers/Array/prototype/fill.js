var astQuery = require('grasp-equery').query;

exports.name = 'Array.prototype.fill';
exports.test = function (ast) {
    return astQuery('__.fill(_$)', ast).length > 0;
};
