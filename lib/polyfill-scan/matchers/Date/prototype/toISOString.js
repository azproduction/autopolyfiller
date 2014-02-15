var astQuery = require('grasp-equery').query;

exports.name = 'Date.prototype.toISOString';
exports.test = function (ast) {
    return astQuery('__.toISOString(_$)', ast).length > 0;
};
