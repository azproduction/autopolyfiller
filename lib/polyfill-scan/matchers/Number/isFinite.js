var astQuery = require('grasp-equery').query;

exports.name = 'Number.isFinite';
exports.test = function (ast) {
    return astQuery('Number.isFinite(_$)', ast).length > 0;
};
