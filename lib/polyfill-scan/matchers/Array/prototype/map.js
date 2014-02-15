var astQuery = require('grasp-equery').query;

exports.name = 'Array.prototype.map';
exports.test = function (ast) {
    return astQuery('__.map(_$)', ast).length > 0;
};
