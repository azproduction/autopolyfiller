var astQuery = require('grasp-equery').query;

exports.name = 'JSON.stringify';
exports.test = function (ast) {
    return astQuery('JSON.stringify(_$)', ast).length > 0;
};
