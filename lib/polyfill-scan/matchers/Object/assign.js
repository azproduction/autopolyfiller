var astQuery = require('grasp-equery').query;

exports.name = 'Object.assign';
exports.test = function (ast) {
    return astQuery('Object.assign(_$)', ast).length > 0;
};
