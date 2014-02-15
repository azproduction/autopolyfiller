var astQuery = require('grasp-equery').query;

exports.name = 'Object.isSealed';
exports.test = function (ast) {
    return astQuery('Object.isSealed(_$)', ast).length > 0;
};
