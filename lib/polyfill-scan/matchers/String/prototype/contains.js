var astQuery = require('grasp-equery').query;

exports.name = 'String.prototype.contains';
exports.test = function (ast) {
    return astQuery('__.contains(_$)', ast).length > 0;
};
