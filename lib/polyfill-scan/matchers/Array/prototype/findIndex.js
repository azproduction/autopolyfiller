var astQuery = require('grasp-equery').query;

exports.name = 'Array.prototype.findIndex';
exports.test = function (ast) {
    return astQuery('__.findIndex(_$)', ast).length > 0;
};
