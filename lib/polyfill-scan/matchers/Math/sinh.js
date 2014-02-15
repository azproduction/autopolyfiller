var astQuery = require('grasp-equery').query;

exports.name = 'Math.sinh';
exports.test = function (ast) {
    return astQuery('Math.sinh(_$)', ast).length > 0;
};
