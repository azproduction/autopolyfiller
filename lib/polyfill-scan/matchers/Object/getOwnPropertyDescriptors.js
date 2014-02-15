var astQuery = require('grasp-equery').query;

exports.name = 'Object.getOwnPropertyDescriptors';
exports.test = function (ast) {
    return astQuery('Object.getOwnPropertyDescriptors(_$)', ast).length > 0;
};
