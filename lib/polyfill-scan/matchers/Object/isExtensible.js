var astQuery = require('grasp-equery').query;

exports.name = 'Object.isExtensible';
exports.test = function (ast) {
    return astQuery('Object.isExtensible(_$)', ast).length > 0;
};
