var astQuery = require('grasp-equery').query;

exports.name = 'String.prototype.endsWith';
exports.test = function (ast) {
    return astQuery('__.endsWith(_$)', ast).length > 0;
};
