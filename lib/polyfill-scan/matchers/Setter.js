var astQuery = require('grasp-equery').query;

exports.name = 'Setter';
exports.test = function (ast) {
    return astQuery('new Setter(_$)', ast).length > 0;
};
