var astQuery = require('grasp-equery').query;

exports.name = 'Function.prototype.bind';
exports.test = function (ast) {
    return astQuery('__.bind(_$)', ast).length > 0;
};
