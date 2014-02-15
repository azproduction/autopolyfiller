var astQuery = require('grasp-equery').query;

exports.name = 'Array.prototype.every';
exports.test = function (ast) {
    return astQuery('__.every(_$)', ast).length > 0;
};
