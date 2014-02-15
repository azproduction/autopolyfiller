var astQuery = require('grasp-equery').query;

exports.name = 'String.prototype.codePointAt';
exports.test = function (ast) {
    return astQuery('__.codePointAt(_$)', ast).length > 0;
};
