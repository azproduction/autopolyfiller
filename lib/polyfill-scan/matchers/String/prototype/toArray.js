var astQuery = require('grasp-equery').query;

exports.name = 'String.prototype.toArray';
exports.test = function (ast) {
    return astQuery('__.toArray(_$)', ast).length > 0;
};
