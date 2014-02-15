var astQuery = require('grasp-equery').query;

exports.name = 'WeakMap';
exports.test = function (ast) {
    return astQuery('new WeakMap(_$)', ast).length > 0;
};
