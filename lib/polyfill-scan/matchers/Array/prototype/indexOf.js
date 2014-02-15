var astQuery = require('grasp-equery').query;

exports.name = 'Array.prototype.indexOf';
exports.test = function (ast) {
    return astQuery('__.indexOf(_$)', ast).length > 0;
};
