var astQuery = require('grasp-equery').query;

exports.name = 'Set';
exports.test = function (ast) {
    return astQuery('new Set(_$)', ast).length > 0;
};
