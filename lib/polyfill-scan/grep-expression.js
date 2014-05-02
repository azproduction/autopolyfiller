var traverse = require('estraverse').traverse;

module.exports = function (ast) {
    var expressions = [];

    traverse(ast, {
        enter: function (node) {
            if (node.type === 'MemberExpression' || node.type === 'Identifier') {
                expressions.push(node);
            }
        }
    });

    return expressions;
};
