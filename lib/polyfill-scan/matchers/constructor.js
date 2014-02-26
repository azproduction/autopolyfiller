var astQuery = require('grasp-equery').query;

var constructors = {
    'WeakMap': 'WeakMap',
    'Symbol': 'Symbol',
    'Set': 'Set',
    'Proxy': 'Proxy',
    'Promise': 'Promise',
    'Map': 'Map'
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
            polyfils.push(constructors[statement.callee.name]);
        }
        return polyfils;
    }, []);
};
