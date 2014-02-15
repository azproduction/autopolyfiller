var astQuery = require('grasp-equery').query;

exports.name = 'JSON.parse';
exports.test = function (ast) {
    return astQuery('JSON.parse(_$)', ast).length > 0;
};
