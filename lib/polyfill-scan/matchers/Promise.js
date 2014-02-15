var astQuery = require('grasp-equery').query;

exports.name = 'Promise';
exports.test = function (ast) {
    return astQuery('new Promise(_$)', ast).length > 0;
};
