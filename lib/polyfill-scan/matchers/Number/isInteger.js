var astQuery = require('grasp-equery').query;

exports.name = 'Number.isInteger';
exports.test = function (ast) {
    return astQuery('Number.isInteger(_$)', ast).length > 0;
};
