var astQuery = require('grasp-equery').query;

exports.name = 'Array.prototype.reduce';
exports.test = function (ast) {
    return astQuery('__.reduce(_$)', ast).length > 0;
};
