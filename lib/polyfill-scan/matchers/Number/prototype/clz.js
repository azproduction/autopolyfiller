var astQuery = require('grasp-equery').query;

exports.name = 'Number.prototype.clz';
exports.test = function (ast) {
    return astQuery('__.clz(_$)', ast).length > 0;
};
