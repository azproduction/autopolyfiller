var astQuery = require('grasp-equery').query;

var statics = {
    'Array': {
        'from': true,
        'isArray': true,
        'of': true
    },
    'Date': {
        'now': true
    },
    'JSON': {
        'parse': true,
        'stringify': true
    },
    'Math': {
        'acosh': true,
        'asinh': true,
        'atanh': true,
        'cosh': true,
        'expm1': true,
        'fround': true,
        'hypot': true,
        'imul': true,
        'log10': true,
        'log1p': true,
        'log2': true,
        'sign': true,
        'sinh': true,
        'tanh': true,
        'trunc': true
    },
    'Number': {
        'isFinite': true,
        'isInteger': true,
        'isNaN': true,
        'toInteger': true
    },
    'Object': {
        'assign': true,
        'create': true,
        'defineProperties': true,
        'defineProperty': true,
        'freeze': true,
        'getOwnPropertyDescriptor': true,
        'getOwnPropertyDescriptors': true,
        'getOwnPropertyNames': true,
        'getPropertyDescriptor': true,
        'getPropertyNames': true,
        'getPrototypeOf': true,
        'is': true,
        'isExtensible': true,
        'isFrozen': true,
        'isSealed': true,
        'keys': true,
        'observe': true,
        'preventExtensions': true,
        'seal': true,
        'setPrototypeOf': true
    }
};

var functionMethods = {
    'bind': true,
    'apply': true,
    'call': true
};

exports.test = function (ast) {
    var statements = astQuery('__.__(_$)', ast);

    /*
    {
        "type": "CallExpression",
        "callee": {
            "type": "MemberExpression",
            "object": {
                "type": "Identifier",
                "name": "Object"
            },
            "property": {
                "type": "Identifier",
                "name": "create"
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
                    "type": "Identifier",
                    "name": "JSON"
                },
                "property": {
                    "type": "Identifier",
                    "name": "parse"
                },
                "computed": false
            },
            "property": {
                "type": "Identifier",
                "name": "call"
            },
            "computed": false
        },
        "arguments": [
        ]
    }
    */
    return statements.reduce(function (polyfils, statement) {
        var staticMethodName = statement.callee && statement.callee.property && statement.callee.property.name,
            objectName = statement.callee && statement.callee.object && statement.callee.object.name;

        // in case of .call() .apply() or .bind() change static method name and object name
        if (functionMethods[staticMethodName]) {
            staticMethodName = statement.callee &&
                statement.callee.object &&
                statement.callee.object.property &&
                statement.callee.object.property.name;

            objectName = statement.callee &&
                statement.callee.object &&
                statement.callee.object.object &&
                statement.callee.object.object.name;
        }

        var isExists = statics[objectName] && staticMethodName in statics[objectName];

        if (isExists) {
            polyfils.push(objectName + '.' + staticMethodName);
        }

        return polyfils;
    }, []);
};
