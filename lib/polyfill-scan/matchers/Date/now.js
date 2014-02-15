var astQuery = require('grasp-equery').query;

exports.name = 'Date.now';
exports.test = function (ast) {
    return astQuery('Date.now(_$)', ast).length > 0;
};
