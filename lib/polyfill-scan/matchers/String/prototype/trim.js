var astQuery = require('grasp-equery').query;

exports.name = 'String.prototype.trim';
exports.test = function (ast) {
    return astQuery('__.trim(_$)', ast).length > 0;
};
