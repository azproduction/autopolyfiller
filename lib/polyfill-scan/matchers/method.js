var astQuery = require('grasp-equery').query;

var methods = {
    // Array
    'every': 'Array.prototype.every',
    'fill': 'Array.prototype.fill',
    'filter': 'Array.prototype.filter',
    'find': 'Array.prototype.find',
    'findIndex': 'Array.prototype.findIndex',
    'forEach': 'Array.prototype.forEach',
    'indexOf': 'Array.prototype.indexOf',
    'lastIndexOf': 'Array.prototype.lastIndexOf',
    'map': 'Array.prototype.map',
    'reduce': 'Array.prototype.reduce',
    'reduceRight': 'Array.prototype.reduceRight',
    'some': 'Array.prototype.some',

    // Date
    'toISOString': 'Date.prototype.toISOString',

    // Function
    'bind': 'Function.prototype.bind',

    // Number
    'clz': 'Number.prototype.clz',

    // String
    'codePointAt': 'String.prototype.codePointAt',
    'contains': 'String.prototype.contains',
    'endsWith': 'String.prototype.endsWith',
    'repeat': 'String.prototype.repeat',
    'startsWith': 'String.prototype.startsWith',
    'toArray': 'String.prototype.toArray',
    'trim': 'String.prototype.trim'
};

var functionMethods = {
    'bind': true,
    'apply': true,
    'call': true
};

function addTo(name, polyfils) {
    var polyfillName = methods.hasOwnProperty(name) ? methods[name] : void 0;
    if (polyfillName) {
        polyfils.push(polyfillName);
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
