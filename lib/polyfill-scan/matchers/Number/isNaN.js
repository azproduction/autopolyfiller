var astQuery = require('grasp-equery').query;

exports.name = 'Number.isNaN';
exports.test = function (ast) {
    return astQuery('Number.isNaN(_$)', ast).length > 0;
};
