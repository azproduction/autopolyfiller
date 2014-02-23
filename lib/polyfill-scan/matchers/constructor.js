var astQuery = require('grasp-equery').query;

var constructors = {
    'WeakMap': true,
    'Symbol': true,
    'Set': true,
    'Proxy': true,
    'Promise': true,
    'Map': true
};

exports.test = function (ast) {
    var statements = astQuery('new __(_$)', ast);
    /*{
        type: 'NewExpression',
        callee: {
            type: 'Identifier',
            name: 'Promise'
        },
        arguments: []
    }*/
    return statements.reduce(function (polyfils, statement) {
        if (statement.callee && constructors.hasOwnProperty(statement.callee.name)) {
            polyfils.push(statement.callee.name);
        }
        return polyfils;
    }, []);
};
