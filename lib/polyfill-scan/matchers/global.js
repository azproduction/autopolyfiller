var astQuery = require('grasp-equery').query;

var globalFunctions = {
    'btoa': 'Window.prototype.base64',
    'atob': 'Window.prototype.base64',
    'matchMedia': 'Window.prototype.matchMedia'
};

var functionMethods = {
    'bind': true,
    'apply': true,
    'call': true
};

function match_MemberExpression_property_Identifier(statement) {
    return statement.callee &&
        statement.callee.type === 'MemberExpression' &&

        statement.callee.property &&
        statement.callee.property.type === 'Identifier' &&
        globalFunctions.hasOwnProperty(statement.callee.property.name);
}

function match_MemberExpression_object_Identifier(statement) {
    return statement.callee &&
        statement.callee.type === 'MemberExpression' &&

        statement.callee.object &&
        statement.callee.object.type === 'Identifier' &&
        globalFunctions.hasOwnProperty(statement.callee.object.name);
}

function match_MemberExpression_MemberExpression_property_Identifier(statement) {
    return statement.callee &&
        statement.callee.type === 'MemberExpression' &&

        statement.callee.object &&
        statement.callee.object.type === 'MemberExpression' &&
        statement.callee.object.property &&
        statement.callee.object.property.type === 'Identifier' &&
        globalFunctions.hasOwnProperty(statement.callee.object.property.name);
}

function match_CallExpression_functionMethod(statement) {
    return statement.callee &&
        statement.callee.property &&
        statement.callee.property.type === 'Identifier' &&
        functionMethods.hasOwnProperty(statement.callee.property.name);
}

var matchers = [
    /*
    btoa();

    {
        "type": "CallExpression",
        "callee": {
            "type": "Identifier",
            "name": "btoa"
        },
        "arguments": []
    }
    */
    function (statement) {
        if (statement.callee &&
            statement.callee.type === 'Identifier' &&
            globalFunctions.hasOwnProperty(statement.callee.name)) {

            return globalFunctions[statement.callee.name];
        }
    },

    /*
    btoa.{call,apply,bind}();

    {
        "type": "CallExpression",
        "callee": {
            "type": "MemberExpression",
            "object": {
                "type": "Identifier",
                "name": "btoa"
            },
            "property": {
                "type": "Identifier",
                "name": "bind"
            },
            "computed": false
        },
        "arguments": []
    }
    */
    function (statement) {
        if (match_MemberExpression_object_Identifier(statement) &&
            match_CallExpression_functionMethod(statement)) {

            return globalFunctions[statement.callee.object.name];
        }
    },

    /*
    window.btoa();

    {
        "type": "CallExpression",
        "callee": {
            "type": "MemberExpression",
            "object": {
                "type": "Identifier",
                "name": "window"
            },
            "property": {
                "type": "Identifier",
                "name": "btoa"
            },
            "computed": false
        },
        "arguments": []
    }
    */
    function (statement) {
        if (match_MemberExpression_property_Identifier(statement) &&
            statement.callee.object &&
            statement.callee.object.type === 'Identifier' &&
            statement.callee.object.name === 'window') {

            return globalFunctions[statement.callee.property.name];
        }
    },

    /*
    this.btoa();

    {
        "type": "CallExpression",
        "callee": {
            "type": "MemberExpression",
            "object": {
                "type": "ThisExpression"
            },
            "property": {
                "type": "Identifier",
                "name": "btoa"
            },
            "computed": false
        },
        "arguments": []
    }
    */
    function (statement) {
        if (match_MemberExpression_property_Identifier(statement) &&
            statement.callee.object &&
            statement.callee.object.type === 'ThisExpression') {

            return globalFunctions[statement.callee.property.name];
        }
    },

    /*
    window.btoa.{call,apply,bind}();

    {
        "type": "CallExpression",
        "callee": {
            "type": "MemberExpression",
            "object": {
                "type": "MemberExpression",
                "object": {
                    "type": "Identifier",
                    "name": "window"
                },
                "property": {
                    "type": "Identifier",
                    "name": "btoa"
                },
                "computed": false
            },
            "property": {
                "type": "Identifier",
                "name": "call"
            },
            "computed": false
        },
        "arguments": []
    }
    */
    function (statement) {
        if (match_MemberExpression_MemberExpression_property_Identifier(statement) &&
            match_CallExpression_functionMethod(statement) &&
            statement.callee.object.object.type === 'Identifier' &&
            statement.callee.object.object.name === 'window') {

            return globalFunctions[statement.callee.object.property.name];
        }
    },

    /*
    this.btoa.{call,apply,bind}();

    {
        "type": "CallExpression",
        "callee": {
            "type": "MemberExpression",
            "object": {
                "type": "MemberExpression",
                "object": {
                    "type": "ThisExpression"
                },
                "property": {
                    "type": "Identifier",
                    "name": "btoa"
                },
                "computed": false
            },
            "property": {
                "type": "Identifier",
                "name": "call"
            },
            "computed": false
        },
        "arguments": []
    }
    */
    function (statement) {
        if (match_MemberExpression_MemberExpression_property_Identifier(statement) &&
            match_CallExpression_functionMethod(statement) &&
            statement.callee.object.object.type === 'ThisExpression') {

            return globalFunctions[statement.callee.object.property.name];
        }
    }
];

var expressions = {
    CallExpression: function (polyfils, statement) {

        // Tll first match
        matchers.some(function (matcher) {
            var polyfill = matcher(statement);

            if (polyfill) {
                polyfils.push(polyfill);
                return true;
            }
        });

        return polyfils;
    }
};

exports.test = function (ast) {
    var statements = astQuery('__(_$)', ast);

    return statements.reduce(function (polyfils, statement) {
        return expressions[statement.type](polyfils, statement);
    }, []);
};
