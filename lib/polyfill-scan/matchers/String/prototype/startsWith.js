var astQuery = require('grasp-equery').query;

exports.name = 'String.prototype.startsWith';
exports.test = function (ast) {
    return astQuery('__.startsWith(_$)', ast).length > 0;
};
