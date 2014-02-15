var astQuery = require('grasp-equery').query;

exports.name = 'String.prototype.repeat';
exports.test = function (ast) {
    return astQuery('__.repeat(_$)', ast).length > 0;
};
