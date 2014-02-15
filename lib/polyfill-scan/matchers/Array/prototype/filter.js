var astQuery = require('grasp-equery').query;

exports.name = 'Array.prototype.filter';
exports.test = function (ast) {
    return astQuery('__.filter(_$)', ast).length > 0;
};
