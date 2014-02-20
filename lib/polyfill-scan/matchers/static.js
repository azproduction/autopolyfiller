var astQuery = require('grasp-equery').query;

var statics = {
    'Array': {
        'from': 'Array.from',
        'isArray': 'Array.isArray',
        'of': 'Array.of'
    },
    'Date': {
        'now': 'Date.now'
    },
    'JSON': {
        'parse': 'Window.prototype.JSON',
        'stringify': 'Window.prototype.JSON'
    },
    'Math': {
        'acosh': 'Math.acosh',
        'asinh': 'Math.asinh',
        'atanh': 'Math.atanh',
        'cosh': 'Math.cosh',
        'expm1': 'Math.expm1',
        'fround': 'Math.fround',
        'hypot': 'Math.hypot',
        'imul': 'Math.imul',
        'log10': 'Math.log10',
        'log1p': 'Math.log1p',
        'log2': 'Math.log2',
        'sign': 'Math.sign',
        'sinh': 'Math.sinh',
        'tanh': 'Math.tanh',
        'trunc': 'Math.trunc'
    },
    'Number': {
        'isFinite': 'Number.isFinite',
        'isInteger': 'Number.isInteger',
        'isNaN': 'Number.isNaN',
        'toInteger': 'Number.toInteger'
    },
    'Object': {
        'assign': 'Object.assign',
        'create': 'Object.create',
        'defineProperties': 'Object.defineProperties',
        'defineProperty': 'Object.defineProperty',
        'freeze': 'Object.freeze',
        'getOwnPropertyDescriptor': 'Object.getOwnPropertyDescriptor',
        'getOwnPropertyDescriptors': 'Object.getOwnPropertyDescriptors',
        'getOwnPropertyNames': 'Object.getOwnPropertyNames',
        'getPropertyDescriptor': 'Object.getPropertyDescriptor',
        'getPropertyNames': 'Object.getPropertyNames',
        'getPrototypeOf': 'Object.getPrototypeOf',
        'is': 'Object.is',
        'isExtensible': 'Object.isExtensible',
        'isFrozen': 'Object.isFrozen',
        'isSealed': 'Object.isSealed',
        'keys': 'Object.keys',
        'observe': 'Object.observe',
        'preventExtensions': 'Object.preventExtensions',
        'seal': 'Object.seal',
        'setPrototypeOf': 'Object.setPrototypeOf'
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

        var polyFillName = statics[objectName] && statics[objectName][staticMethodName];

        if (polyFillName) {
            polyfils.push(polyFillName);
        }

        return polyfils;
    }, []);
};
