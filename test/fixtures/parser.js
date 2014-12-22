exports.parse = function(code, options) {
    if (code !== 'array.map(x => x * x)') {
        throw new Error('Can not parse');
    }

    if (options && typeof options !== 'object') {
        throw new Error('Bad options');
    }

    return {
        "type": "Program",
        "body": [
            {
                "type": "ExpressionStatement",
                "expression": {
                    "type": "CallExpression",
                    "callee": {
                        "type": "MemberExpression",
                        "computed": false,
                        "object": {
                            "type": "Identifier",
                            "name": "array"
                        },
                        "property": {
                            "type": "Identifier",
                            "name": "map"
                        }
                    },
                    "arguments": [
                        {
                            "type": "ArrowFunctionExpression",
                            "id": null,
                            "params": [
                                {
                                    "type": "Identifier",
                                    "name": "x"
                                }
                            ],
                            "defaults": [],
                            "body": {
                                "type": "BinaryExpression",
                                "operator": "*",
                                "left": {
                                    "type": "Identifier",
                                    "name": "x"
                                },
                                "right": {
                                    "type": "Identifier",
                                    "name": "x"
                                }
                            },
                            "rest": null,
                            "generator": false,
                            "expression": true
                        }
                    ]
                }
            }
        ]
    };
};
