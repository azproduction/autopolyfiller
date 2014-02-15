var astQuery = require('grasp-equery').query;

exports.name = 'Map';
exports.test = function (ast) {
    return astQuery('new Map(_$)', ast).length > 0;
};
