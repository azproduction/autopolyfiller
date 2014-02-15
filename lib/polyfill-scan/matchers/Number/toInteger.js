var astQuery = require('grasp-equery').query;

exports.name = 'Number.toInteger';
exports.test = function (ast) {
    return astQuery('Number.toInteger(_$)', ast).length > 0;
};
