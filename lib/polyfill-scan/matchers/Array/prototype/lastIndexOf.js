var astQuery = require('grasp-equery').query;

exports.name = 'Array.prototype.lastIndexOf';
exports.test = function (ast) {
    return astQuery('__.lastIndexOf(_$)', ast).length > 0;
};
