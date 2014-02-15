var astQuery = require('grasp-equery').query;

exports.name = 'Math.hypot';
exports.test = function (ast) {
    return astQuery('Math.hypot(_$)', ast).length > 0;
};
