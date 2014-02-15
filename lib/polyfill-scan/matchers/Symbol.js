var astQuery = require('grasp-equery').query;

exports.name = 'Symbol';
exports.test = function (ast) {
    return astQuery('new Symbol(_$)', ast).length > 0;
};
