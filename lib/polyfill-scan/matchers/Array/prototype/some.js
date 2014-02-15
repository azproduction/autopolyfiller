var astQuery = require('grasp-equery').query;

exports.name = 'Array.prototype.some';
exports.test = function (ast) {
    return astQuery('__.some(_$)', ast).length > 0;
};
