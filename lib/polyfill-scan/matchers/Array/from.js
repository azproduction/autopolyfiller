var astQuery = require('grasp-equery').query;

exports.name = 'Array.from';
exports.test = function (ast) {
    return astQuery('Array.from(_$)', ast).length > 0;
};
