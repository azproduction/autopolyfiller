var astQuery = require('grasp-equery').query;

exports.name = 'Array.prototype.find';
exports.test = function (ast) {
    return astQuery('__.find(_$)', ast).length > 0;
};
