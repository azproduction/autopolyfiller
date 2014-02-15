var astQuery = require('grasp-equery').query;

exports.name = 'Array.prototype.reduceRight';
exports.test = function (ast) {
    return astQuery('__.reduceRight(_$)', ast).length > 0;
};
