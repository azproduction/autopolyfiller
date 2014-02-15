var astQuery = require('grasp-equery').query;

exports.name = 'Array.prototype.forEach';
exports.test = function (ast) {
    return astQuery('__.forEach(_$)', ast).length > 0;
};
