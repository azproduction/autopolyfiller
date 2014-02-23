var astQuery = require('grasp-equery').query;

var methods = {
    // Array
    'every': 'Array',
    'fill': 'Array',
    'filter': 'Array',
    'find': 'Array',
    'findIndex': 'Array',
    'forEach': 'Array',
    'indexOf': 'Array',
    'lastIndexOf': 'Array',
    'map': 'Array',
    'reduce': 'Array',
    'reduceRight': 'Array',
    'some': 'Array',

    // Date
    'toISOString': 'Date',

    // Function
    'bind': 'Function',

    // Number
    'clz': 'Number',

    // String
    'codePointAt': 'String',
    'contains': 'String',
    'endsWith': 'String',
    'repeat': 'String',
    'startsWith': 'String',
    'toArray': 'String',
    'trim': 'String'
};

var functionMethods = {
    'bind': true,
    'apply': true,
    'call': true
};

function addTo(name, polyfils) {
    var type = methods.hasOwnProperty(name) ? methods[name] : void 0;
    if (type) {
        polyfils.push(type + '.prototype.' + name);
    }
}

exports.test = function (ast) {
    var statements = astQuery('__.__(_$)', ast);

    /*{
        "type": "CallExpression",
        "callee": {
            "type": "MemberExpression",
            "object": {
                "type": "Literal",
                "value": "",
                "raw": "\"\""
            },
            "property": {
                "type": "Identifier",
                "name": "trim"
            },
            "computed": false
        },
        "arguments": []
    }

    OR

    {
        "type": "CallExpression",
        "callee": {
            "type": "MemberExpression",
            "object": {
                "type": "MemberExpression",
                "object": {
                    "type": "Literal",
                    "value": "",
                    "raw": "\"\""
                },
                "property": {
                    "type": "Identifier",
                    "name": "repeat"
                },
                "computed": false
            },
            "property": {
                "type": "Identifier",
                "name": "apply"
            },
            "computed": false
        },
        "arguments": [
        ]
    }
    */

    return statements.reduce(function (polyfils, statement) {
        var name = statement.callee && statement.callee.property && statement.callee.property.name;

        // in case of bind();
        addTo(name, polyfils);

        // in case of .call() .apply() or .bind() change method name
        if (functionMethods.hasOwnProperty(name)) {
            name = statement.callee &&
                statement.callee.object &&
                statement.callee.object.property &&
                statement.callee.object.property.name;

            addTo(name, polyfils);
        }

        return polyfils;
    }, []);
};
