var astQuery = require('grasp-equery').query;

exports.name = 'Object.freeze';
exports.test = function (ast) {
    return astQuery('Object.freeze(_$)', ast).length > 0;
};
