(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var autopolyfiller = require('../lib');

function $(sel) {
    return document.querySelector(sel);
}

setTimeout(function () {
    var $code = $('#code'),
        $browsers = $('#browsers'),
        $polyfills = $('#polyfills'),
        $generateButton = $('#generate');

    function generate() {
        console.time('Scan for polyfills');
        try {
            var browsers = ($browsers.value || '').toLowerCase().split(',').map(function (string) {
                return string.trim();
            });

            var polyfills = autopolyfiller(browsers).add($code.value || '').polyfills;

            $polyfills.innerHTML = polyfills
                .map(function (polyfill) {
                    return '<Li>' +
                        '<a href="https://github.com/jonathantneal/polyfill/blob/master/source/' + polyfill + '.js">' +
                            polyfill +
                        '</a>' +
                    '</Li>';
                }).join('');

            console.timeEnd('Scan for polyfills');
        } catch (e) {
            console.timeEnd('Scan for polyfills');
            console.error(e);
        }
    }

    $code.addEventListener('input', generate, false);
    $browsers.addEventListener('input', generate, false);
    $generateButton.addEventListener('click', generate, false);

    generate();
}, 0);

},{"../lib":2}],2:[function(require,module,exports){
var scan = require('./polyfill-scan'),
    reduce = require('./polyfill-reduce'),
    polyfill = require('polyfill'),
    extend = require('node.extend');

/**
 *
 * @param {Object}   options
 * @param {String}   [options.code]
 * @param {String[]} [options.browsers] Autoprefixer style list of browsers
 *
 * @example
 *
 * new AutoPolyFiller({
 *     browsers: ['IE 11', 'Chrome >= 31']
 * })
 * .add('"".trim();Object.create();new Promise()')
 * .polyfills;
 * // ['Promise']
 */
function AutoPolyFiller(options) {
    this.browsers = options.browsers;
    this.polyfills = [];
}

AutoPolyFiller.prototype = {
    /**
     * @param {String} code
     * @returns {String[]}
     * @private
     */
    _scan: function (code) {
        var polyfills = scan(code);

        // Do not reduce if no browsers
        if (this.browsers && this.browsers.length === 0) {
            return polyfills;
        }
        return reduce(polyfills, this.browsers);
    },

    /**
     *
     * @param {String} code
     * @returns {AutoPolyFiller}
     */
    add: function (code) {
        this.polyfills = this.polyfills
            .concat(this._scan(code))
            .reduce(function (polyfills, polyfill) {
                if (polyfills.indexOf(polyfill) === -1) {
                    polyfills.push(polyfill);
                }
                return polyfills;
            }, []);

        return this;
    },

    /**
     *
     * @returns {string} code that polyfills all listed functions
     */
    toString: function () {
        return this.polyfills.map(function (polyfillName) {
            var code = polyfill.source[polyfillName];

            if (!code) {
                throw new Error('Unknown feature: ' + polyfillName);
            }

            return code;
        }).join('');
    }
};

module.exports = function () {
    var browsers = 1 <= arguments.length ? [].slice.call(arguments, 0) : [];

    if (browsers.length === 1 && browsers[0] instanceof Array) {
        browsers = browsers[0];
    }

    return new AutoPolyFiller({
        browsers: browsers
    });
};

/**
 *
 * @param {Object}   config
 * @param {Function} [config.test]
 * @param {Object}   [config.support]
 * @param {Object}   [config.polyfill]
 */
module.exports.use = function (config) {
    if (config.test) {
        scan.use({
            test: config.test
        });
    }

    if (config.support) {
        reduce.support(config.support);
    }

    if (config.polyfill) {
        extend(polyfill.source, config.polyfill);
    }
};

},{"./polyfill-reduce":4,"./polyfill-scan":5,"node.extend":29,"polyfill":35}],3:[function(require,module,exports){
module.exports={
	"Opera Mini": [{
		"fill": "Promise"
	}],
	"Opera Mobile": [{
        "fill": "Promise"
    }],
	"Opera": [{
        "fill": "Promise"
    }],
	"Android": [{
        "fill": "Promise"
    }],
	"BlackBerry": [{
        "fill": "Promise"
    }],
	"Chrome iOS": [{
        "fill": "Promise"
    }],
	"Safari iOS": [{
        "fill": "Promise"
    }],
	"Chrome": [{
        "fill": "Promise"
    }],
	"Internet Explorer": [{
        "fill": "Promise"
    }],
	"Firefox": [{
        "fill": "Promise"
    }],
	"Safari": [{
        "fill": "Promise"
    }]
}
},{}],4:[function(require,module,exports){
var Browsers = require('autoprefixer/lib/browsers'),
    browsersData = require('autoprefixer/data/browsers'),
    debug = require('debug')('polyfill-reduce'),
    polyfill = require('polyfill');

var polyFillSets = polyfill.agent.js;

// Autoprefixer browser code to polyfill agent name
var browserMap = {
//    0: 'Opera Mini',
//    1: 'Opera Mobile',
    'opera': 'Opera',
    'android': 'Android',
    'bb': 'BlackBerry',
//    '-': 'Chrome iOS',
    'ios': 'Safari iOS',
    'chrome': 'Chrome',
    'ie': 'Internet Explorer',
    'ff': 'Firefox',
    'safari': 'Safari'
};

var reBrowserAndVersion = /^(\w+) ([\d\.]+)$/;

/**
 *
 * @param {String} browserCode
 * @param {String} version
 */
function polyFillsFor(browserCode, version) {
    var polyFillSet = polyFillSets[browserMap[browserCode]];

    if (!polyFillSet) {
        return [];
    }

    return polyFillSet.reduce(function (polyfills, range) {
        var isMatches =
            // X === A
            (range.only && range.only === version) ||
            // X >= A
            (range.min && !range.max && version >= range.min) ||
            // A <= X <= B
            (range.min && range.max && version >= range.min && version <= range.max) ||
            // Always
            (!range.min && !range.max && !range.only);

        if (isMatches) {
            return polyfills.concat(range.fill.split(' '));
        }

        return polyfills;
    }, []);
}

/**
 *
 * @param {String[]} polyfills        List of polyfill names from polyfill-scan
 * @param {String[]} browsersRequest  Autoprefixer-style list of browsers or versions
 *
 * @returns {String[]} reduced list of polyfills
 *
 * @example
 *
 * reduce(['JSON.parse'], ['Explorer 10', '> 5%'])
 * // []
 */
function reduce(polyfills, browsersRequest) {
    var browsers = new Browsers(browsersData, browsersRequest).selected;
    debug('%s are selected', browsers);

    var requiredPolyFills = browsers
        .reduce(function (requiredPolyFills, browserAndVersion) {
            var parts = browserAndVersion.match(reBrowserAndVersion);

            return requiredPolyFills.concat(polyFillsFor.apply(null, parts.slice(1, 3)));
        }, [])
        // Make unique and cast to hash
        .reduce(function (polyfills, polyfill) {
            polyfills[polyfill] = true;

            return polyfills;
        }, {});

    return polyfills.filter(function (polyfill) {
        var shouldPolyFill = polyfill in requiredPolyFills;
        debug((shouldPolyFill ? 'keeping  ' : 'removing ') + polyfill);
        return shouldPolyFill;
    });
}

/**
 * @param {Object} polyfills
 */
function support(polyfills) {
    debug('adding custom supported polyfills');
    Object.keys(polyfills).forEach(function (browser) {
        if (!polyFillSets[browser]) {
            polyFillSets[browser] = [];
        }

        polyFillSets[browser].push.apply(polyFillSets[browser], polyfills[browser]);
    });
}

/**
 * @returns {String[]} list of all available polyfills
 */
function list() {
    return Object.keys(polyFillSets)
        // Collect all available polyfills
        .reduce(function (polyfills, browserName) {
            return polyFillSets[browserName].reduce(function (polyfills, sets) {
                return polyfills.concat(sets.fill.split(' '));
            }, polyfills);
        }, [])
        // Unique
        .reduce(function (polyfills, polyfill) {
            if (polyfills.indexOf(polyfill) === -1) {
                polyfills.push(polyfill);
            }
            return polyfills;
        }, []);
}

// Extra polyfills
support(require('./data/index.json'));

module.exports = reduce;
module.exports.support = support;
module.exports.list = list;

},{"./data/index.json":3,"autoprefixer/data/browsers":11,"autoprefixer/lib/browsers":12,"debug":17,"polyfill":35}],5:[function(require,module,exports){
/*!
 * polyfill-scan
 */
var parse = require('acorn').parse,
    debug = require('debug')('polyfill-scan');

debug('loading matchers');
var matchers = require('./matchers');
debug('%d matchers are loaded', matchers.length);

/**
 *
 * @param {Object}   matcher
 * @param {Function} matcher.test
 */
function use(matcher) {
    debug('adding custom matcher');
    matchers.push(matcher);
}

/**
 * @param {String} code
 * @returns {String[]} list of polyfills
 */
function scan(code) {
    debug('parsing code');
    var ast = parse(code);
    debug('parsing done');

    debug('scanning for polyfills using %d matchers', matchers.length);
    var polyfills = matchers
        .reduce(function (polyfills, matcher) {
            return polyfills.concat(matcher.test(ast));
        }, [])
        // Unique
        .reduce(function (polyfills, polyfill) {
            if (polyfills.indexOf(polyfill) === -1) {
                polyfills.push(polyfill);
            }
            return polyfills;
        }, []);
    debug('got %d polyfill(s)', polyfills.length);

    return polyfills;
}

module.exports = scan;
module.exports.use = use;

},{"./matchers":7,"acorn":10,"debug":17}],6:[function(require,module,exports){
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

},{"grasp-equery":19}],7:[function(require,module,exports){
module.exports = [
    require('./constructor'),
    require('./method'),
    require('./static')
];

},{"./constructor":6,"./method":8,"./static":9}],8:[function(require,module,exports){
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

},{"grasp-equery":19}],9:[function(require,module,exports){
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

var expressions = {
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
    CallExpression: function (polyfils, statement) {
        var staticMethodName = statement.callee && statement.callee.property && statement.callee.property.name,
            objectName = statement.callee && statement.callee.object && statement.callee.object.name;

        // in case of .call() .apply() or .bind() change static method name and object name
        if (functionMethods.hasOwnProperty(staticMethodName)) {
            staticMethodName = statement.callee &&
                statement.callee.object &&
                statement.callee.object.property &&
                statement.callee.object.property.name;

            objectName = statement.callee &&
                statement.callee.object &&
                statement.callee.object.object &&
                statement.callee.object.object.name;
        }

        var polyFillName = statics.hasOwnProperty(objectName) &&
            statics[objectName].hasOwnProperty(staticMethodName) &&
            statics[objectName][staticMethodName];

        if (polyFillName) {
            polyfils.push(polyFillName);
        }

        return polyfils;
    },

    /*
    {
        type: 'MemberExpression',
        object: { type: 'Identifier', name: 'Object' },
        property: { type: 'Identifier', name: 'create' },
        computed: false
    }
    */
    MemberExpression: function (polyfils, statement) {
        var staticMethodName = statement.property && statement.property.name,
            objectName = statement.object && statement.object.name;

        var polyFillName = statics.hasOwnProperty(objectName) &&
            statics[objectName].hasOwnProperty(staticMethodName) &&
            statics[objectName][staticMethodName];

        if (polyFillName) {
            polyfils.push(polyFillName);
        }

        return polyfils;
    }
};

exports.test = function (ast) {
    var statements = astQuery('__.__(_$)', ast).concat(astQuery('__.__', ast));

    return statements.reduce(function (polyfils, statement) {
        return expressions[statement.type](polyfils, statement);
    }, []);
};

},{"grasp-equery":19}],10:[function(require,module,exports){
// Acorn is a tiny, fast JavaScript parser written in JavaScript.
//
// Acorn was written by Marijn Haverbeke and released under an MIT
// license. The Unicode regexps (for identifiers and whitespace) were
// taken from [Esprima](http://esprima.org) by Ariya Hidayat.
//
// Git repositories for Acorn are available at
//
//     http://marijnhaverbeke.nl/git/acorn
//     https://github.com/marijnh/acorn.git
//
// Please use the [github bug tracker][ghbt] to report issues.
//
// [ghbt]: https://github.com/marijnh/acorn/issues
//
// This file defines the main parser interface. The library also comes
// with a [error-tolerant parser][dammit] and an
// [abstract syntax tree walker][walk], defined in other files.
//
// [dammit]: acorn_loose.js
// [walk]: util/walk.js

(function(root, mod) {
  if (typeof exports == "object" && typeof module == "object") return mod(exports); // CommonJS
  if (typeof define == "function" && define.amd) return define(["exports"], mod); // AMD
  mod(root.acorn || (root.acorn = {})); // Plain browser env
})(this, function(exports) {
  "use strict";

  exports.version = "0.4.1";

  // The main exported interface (under `self.acorn` when in the
  // browser) is a `parse` function that takes a code string and
  // returns an abstract syntax tree as specified by [Mozilla parser
  // API][api], with the caveat that the SpiderMonkey-specific syntax
  // (`let`, `yield`, inline XML, etc) is not recognized.
  //
  // [api]: https://developer.mozilla.org/en-US/docs/SpiderMonkey/Parser_API

  var options, input, inputLen, sourceFile;

  exports.parse = function(inpt, opts) {
    input = String(inpt); inputLen = input.length;
    setOptions(opts);
    initTokenState();
    return parseTopLevel(options.program);
  };

  // A second optional argument can be given to further configure
  // the parser process. These options are recognized:

  var defaultOptions = exports.defaultOptions = {
    // `ecmaVersion` indicates the ECMAScript version to parse. Must
    // be either 3 or 5. This
    // influences support for strict mode, the set of reserved words, and
    // support for getters and setter.
    ecmaVersion: 5,
    // Turn on `strictSemicolons` to prevent the parser from doing
    // automatic semicolon insertion.
    strictSemicolons: false,
    // When `allowTrailingCommas` is false, the parser will not allow
    // trailing commas in array and object literals.
    allowTrailingCommas: true,
    // By default, reserved words are not enforced. Enable
    // `forbidReserved` to enforce them.
    forbidReserved: false,
    // When `locations` is on, `loc` properties holding objects with
    // `start` and `end` properties in `{line, column}` form (with
    // line being 1-based and column 0-based) will be attached to the
    // nodes.
    locations: false,
    // A function can be passed as `onComment` option, which will
    // cause Acorn to call that function with `(block, text, start,
    // end)` parameters whenever a comment is skipped. `block` is a
    // boolean indicating whether this is a block (`/* */`) comment,
    // `text` is the content of the comment, and `start` and `end` are
    // character offsets that denote the start and end of the comment.
    // When the `locations` option is on, two more parameters are
    // passed, the full `{line, column}` locations of the start and
    // end of the comments.
    onComment: null,
    // Nodes have their start and end characters offsets recorded in
    // `start` and `end` properties (directly on the node, rather than
    // the `loc` object, which holds line/column data. To also add a
    // [semi-standardized][range] `range` property holding a `[start,
    // end]` array with the same numbers, set the `ranges` option to
    // `true`.
    //
    // [range]: https://bugzilla.mozilla.org/show_bug.cgi?id=745678
    ranges: false,
    // It is possible to parse multiple files into a single AST by
    // passing the tree produced by parsing the first file as
    // `program` option in subsequent parses. This will add the
    // toplevel forms of the parsed file to the `Program` (top) node
    // of an existing parse tree.
    program: null,
    // When `location` is on, you can pass this to record the source
    // file in every node's `loc` object.
    sourceFile: null,
    // This value, if given, is stored in every node, whether
    // `location` is on or off.
    directSourceFile: null
  };

  function setOptions(opts) {
    options = opts || {};
    for (var opt in defaultOptions) if (!Object.prototype.hasOwnProperty.call(options, opt))
      options[opt] = defaultOptions[opt];
    sourceFile = options.sourceFile || null;
  }

  // The `getLineInfo` function is mostly useful when the
  // `locations` option is off (for performance reasons) and you
  // want to find the line/column position for a given character
  // offset. `input` should be the code string that the offset refers
  // into.

  var getLineInfo = exports.getLineInfo = function(input, offset) {
    for (var line = 1, cur = 0;;) {
      lineBreak.lastIndex = cur;
      var match = lineBreak.exec(input);
      if (match && match.index < offset) {
        ++line;
        cur = match.index + match[0].length;
      } else break;
    }
    return {line: line, column: offset - cur};
  };

  // Acorn is organized as a tokenizer and a recursive-descent parser.
  // The `tokenize` export provides an interface to the tokenizer.
  // Because the tokenizer is optimized for being efficiently used by
  // the Acorn parser itself, this interface is somewhat crude and not
  // very modular. Performing another parse or call to `tokenize` will
  // reset the internal state, and invalidate existing tokenizers.

  exports.tokenize = function(inpt, opts) {
    input = String(inpt); inputLen = input.length;
    setOptions(opts);
    initTokenState();

    var t = {};
    function getToken(forceRegexp) {
      readToken(forceRegexp);
      t.start = tokStart; t.end = tokEnd;
      t.startLoc = tokStartLoc; t.endLoc = tokEndLoc;
      t.type = tokType; t.value = tokVal;
      return t;
    }
    getToken.jumpTo = function(pos, reAllowed) {
      tokPos = pos;
      if (options.locations) {
        tokCurLine = 1;
        tokLineStart = lineBreak.lastIndex = 0;
        var match;
        while ((match = lineBreak.exec(input)) && match.index < pos) {
          ++tokCurLine;
          tokLineStart = match.index + match[0].length;
        }
      }
      tokRegexpAllowed = reAllowed;
      skipSpace();
    };
    return getToken;
  };

  // State is kept in (closure-)global variables. We already saw the
  // `options`, `input`, and `inputLen` variables above.

  // The current position of the tokenizer in the input.

  var tokPos;

  // The start and end offsets of the current token.

  var tokStart, tokEnd;

  // When `options.locations` is true, these hold objects
  // containing the tokens start and end line/column pairs.

  var tokStartLoc, tokEndLoc;

  // The type and value of the current token. Token types are objects,
  // named by variables against which they can be compared, and
  // holding properties that describe them (indicating, for example,
  // the precedence of an infix operator, and the original name of a
  // keyword token). The kind of value that's held in `tokVal` depends
  // on the type of the token. For literals, it is the literal value,
  // for operators, the operator name, and so on.

  var tokType, tokVal;

  // Interal state for the tokenizer. To distinguish between division
  // operators and regular expressions, it remembers whether the last
  // token was one that is allowed to be followed by an expression.
  // (If it is, a slash is probably a regexp, if it isn't it's a
  // division operator. See the `parseStatement` function for a
  // caveat.)

  var tokRegexpAllowed;

  // When `options.locations` is true, these are used to keep
  // track of the current line, and know when a new line has been
  // entered.

  var tokCurLine, tokLineStart;

  // These store the position of the previous token, which is useful
  // when finishing a node and assigning its `end` position.

  var lastStart, lastEnd, lastEndLoc;

  // This is the parser's state. `inFunction` is used to reject
  // `return` statements outside of functions, `labels` to verify that
  // `break` and `continue` have somewhere to jump to, and `strict`
  // indicates whether strict mode is on.

  var inFunction, labels, strict;

  // This function is used to raise exceptions on parse errors. It
  // takes an offset integer (into the current `input`) to indicate
  // the location of the error, attaches the position to the end
  // of the error message, and then raises a `SyntaxError` with that
  // message.

  function raise(pos, message) {
    var loc = getLineInfo(input, pos);
    message += " (" + loc.line + ":" + loc.column + ")";
    var err = new SyntaxError(message);
    err.pos = pos; err.loc = loc; err.raisedAt = tokPos;
    throw err;
  }

  // Reused empty array added for node fields that are always empty.

  var empty = [];

  // ## Token types

  // The assignment of fine-grained, information-carrying type objects
  // allows the tokenizer to store the information it has about a
  // token in a way that is very cheap for the parser to look up.

  // All token type variables start with an underscore, to make them
  // easy to recognize.

  // These are the general types. The `type` property is only used to
  // make them recognizeable when debugging.

  var _num = {type: "num"}, _regexp = {type: "regexp"}, _string = {type: "string"};
  var _name = {type: "name"}, _eof = {type: "eof"};

  // Keyword tokens. The `keyword` property (also used in keyword-like
  // operators) indicates that the token originated from an
  // identifier-like word, which is used when parsing property names.
  //
  // The `beforeExpr` property is used to disambiguate between regular
  // expressions and divisions. It is set on all token types that can
  // be followed by an expression (thus, a slash after them would be a
  // regular expression).
  //
  // `isLoop` marks a keyword as starting a loop, which is important
  // to know when parsing a label, in order to allow or disallow
  // continue jumps to that label.

  var _break = {keyword: "break"}, _case = {keyword: "case", beforeExpr: true}, _catch = {keyword: "catch"};
  var _continue = {keyword: "continue"}, _debugger = {keyword: "debugger"}, _default = {keyword: "default"};
  var _do = {keyword: "do", isLoop: true}, _else = {keyword: "else", beforeExpr: true};
  var _finally = {keyword: "finally"}, _for = {keyword: "for", isLoop: true}, _function = {keyword: "function"};
  var _if = {keyword: "if"}, _return = {keyword: "return", beforeExpr: true}, _switch = {keyword: "switch"};
  var _throw = {keyword: "throw", beforeExpr: true}, _try = {keyword: "try"}, _var = {keyword: "var"};
  var _while = {keyword: "while", isLoop: true}, _with = {keyword: "with"}, _new = {keyword: "new", beforeExpr: true};
  var _this = {keyword: "this"};

  // The keywords that denote values.

  var _null = {keyword: "null", atomValue: null}, _true = {keyword: "true", atomValue: true};
  var _false = {keyword: "false", atomValue: false};

  // Some keywords are treated as regular operators. `in` sometimes
  // (when parsing `for`) needs to be tested against specifically, so
  // we assign a variable name to it for quick comparing.

  var _in = {keyword: "in", binop: 7, beforeExpr: true};

  // Map keyword names to token types.

  var keywordTypes = {"break": _break, "case": _case, "catch": _catch,
                      "continue": _continue, "debugger": _debugger, "default": _default,
                      "do": _do, "else": _else, "finally": _finally, "for": _for,
                      "function": _function, "if": _if, "return": _return, "switch": _switch,
                      "throw": _throw, "try": _try, "var": _var, "while": _while, "with": _with,
                      "null": _null, "true": _true, "false": _false, "new": _new, "in": _in,
                      "instanceof": {keyword: "instanceof", binop: 7, beforeExpr: true}, "this": _this,
                      "typeof": {keyword: "typeof", prefix: true, beforeExpr: true},
                      "void": {keyword: "void", prefix: true, beforeExpr: true},
                      "delete": {keyword: "delete", prefix: true, beforeExpr: true}};

  // Punctuation token types. Again, the `type` property is purely for debugging.

  var _bracketL = {type: "[", beforeExpr: true}, _bracketR = {type: "]"}, _braceL = {type: "{", beforeExpr: true};
  var _braceR = {type: "}"}, _parenL = {type: "(", beforeExpr: true}, _parenR = {type: ")"};
  var _comma = {type: ",", beforeExpr: true}, _semi = {type: ";", beforeExpr: true};
  var _colon = {type: ":", beforeExpr: true}, _dot = {type: "."}, _question = {type: "?", beforeExpr: true};

  // Operators. These carry several kinds of properties to help the
  // parser use them properly (the presence of these properties is
  // what categorizes them as operators).
  //
  // `binop`, when present, specifies that this operator is a binary
  // operator, and will refer to its precedence.
  //
  // `prefix` and `postfix` mark the operator as a prefix or postfix
  // unary operator. `isUpdate` specifies that the node produced by
  // the operator should be of type UpdateExpression rather than
  // simply UnaryExpression (`++` and `--`).
  //
  // `isAssign` marks all of `=`, `+=`, `-=` etcetera, which act as
  // binary operators with a very low precedence, that should result
  // in AssignmentExpression nodes.

  var _slash = {binop: 10, beforeExpr: true}, _eq = {isAssign: true, beforeExpr: true};
  var _assign = {isAssign: true, beforeExpr: true};
  var _incDec = {postfix: true, prefix: true, isUpdate: true}, _prefix = {prefix: true, beforeExpr: true};
  var _logicalOR = {binop: 1, beforeExpr: true};
  var _logicalAND = {binop: 2, beforeExpr: true};
  var _bitwiseOR = {binop: 3, beforeExpr: true};
  var _bitwiseXOR = {binop: 4, beforeExpr: true};
  var _bitwiseAND = {binop: 5, beforeExpr: true};
  var _equality = {binop: 6, beforeExpr: true};
  var _relational = {binop: 7, beforeExpr: true};
  var _bitShift = {binop: 8, beforeExpr: true};
  var _plusMin = {binop: 9, prefix: true, beforeExpr: true};
  var _multiplyModulo = {binop: 10, beforeExpr: true};

  // Provide access to the token types for external users of the
  // tokenizer.

  exports.tokTypes = {bracketL: _bracketL, bracketR: _bracketR, braceL: _braceL, braceR: _braceR,
                      parenL: _parenL, parenR: _parenR, comma: _comma, semi: _semi, colon: _colon,
                      dot: _dot, question: _question, slash: _slash, eq: _eq, name: _name, eof: _eof,
                      num: _num, regexp: _regexp, string: _string};
  for (var kw in keywordTypes) exports.tokTypes["_" + kw] = keywordTypes[kw];

  // This is a trick taken from Esprima. It turns out that, on
  // non-Chrome browsers, to check whether a string is in a set, a
  // predicate containing a big ugly `switch` statement is faster than
  // a regular expression, and on Chrome the two are about on par.
  // This function uses `eval` (non-lexical) to produce such a
  // predicate from a space-separated string of words.
  //
  // It starts by sorting the words by length.

  function makePredicate(words) {
    words = words.split(" ");
    var f = "", cats = [];
    out: for (var i = 0; i < words.length; ++i) {
      for (var j = 0; j < cats.length; ++j)
        if (cats[j][0].length == words[i].length) {
          cats[j].push(words[i]);
          continue out;
        }
      cats.push([words[i]]);
    }
    function compareTo(arr) {
      if (arr.length == 1) return f += "return str === " + JSON.stringify(arr[0]) + ";";
      f += "switch(str){";
      for (var i = 0; i < arr.length; ++i) f += "case " + JSON.stringify(arr[i]) + ":";
      f += "return true}return false;";
    }

    // When there are more than three length categories, an outer
    // switch first dispatches on the lengths, to save on comparisons.

    if (cats.length > 3) {
      cats.sort(function(a, b) {return b.length - a.length;});
      f += "switch(str.length){";
      for (var i = 0; i < cats.length; ++i) {
        var cat = cats[i];
        f += "case " + cat[0].length + ":";
        compareTo(cat);
      }
      f += "}";

    // Otherwise, simply generate a flat `switch` statement.

    } else {
      compareTo(words);
    }
    return new Function("str", f);
  }

  // The ECMAScript 3 reserved word list.

  var isReservedWord3 = makePredicate("abstract boolean byte char class double enum export extends final float goto implements import int interface long native package private protected public short static super synchronized throws transient volatile");

  // ECMAScript 5 reserved words.

  var isReservedWord5 = makePredicate("class enum extends super const export import");

  // The additional reserved words in strict mode.

  var isStrictReservedWord = makePredicate("implements interface let package private protected public static yield");

  // The forbidden variable names in strict mode.

  var isStrictBadIdWord = makePredicate("eval arguments");

  // And the keywords.

  var isKeyword = makePredicate("break case catch continue debugger default do else finally for function if return switch throw try var while with null true false instanceof typeof void delete new in this");

  // ## Character categories

  // Big ugly regular expressions that match characters in the
  // whitespace, identifier, and identifier-start categories. These
  // are only applied when a character is found to actually have a
  // code point above 128.

  var nonASCIIwhitespace = /[\u1680\u180e\u2000-\u200a\u202f\u205f\u3000\ufeff]/;
  var nonASCIIidentifierStartChars = "\xaa\xb5\xba\xc0-\xd6\xd8-\xf6\xf8-\u02c1\u02c6-\u02d1\u02e0-\u02e4\u02ec\u02ee\u0370-\u0374\u0376\u0377\u037a-\u037d\u0386\u0388-\u038a\u038c\u038e-\u03a1\u03a3-\u03f5\u03f7-\u0481\u048a-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05d0-\u05ea\u05f0-\u05f2\u0620-\u064a\u066e\u066f\u0671-\u06d3\u06d5\u06e5\u06e6\u06ee\u06ef\u06fa-\u06fc\u06ff\u0710\u0712-\u072f\u074d-\u07a5\u07b1\u07ca-\u07ea\u07f4\u07f5\u07fa\u0800-\u0815\u081a\u0824\u0828\u0840-\u0858\u08a0\u08a2-\u08ac\u0904-\u0939\u093d\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097f\u0985-\u098c\u098f\u0990\u0993-\u09a8\u09aa-\u09b0\u09b2\u09b6-\u09b9\u09bd\u09ce\u09dc\u09dd\u09df-\u09e1\u09f0\u09f1\u0a05-\u0a0a\u0a0f\u0a10\u0a13-\u0a28\u0a2a-\u0a30\u0a32\u0a33\u0a35\u0a36\u0a38\u0a39\u0a59-\u0a5c\u0a5e\u0a72-\u0a74\u0a85-\u0a8d\u0a8f-\u0a91\u0a93-\u0aa8\u0aaa-\u0ab0\u0ab2\u0ab3\u0ab5-\u0ab9\u0abd\u0ad0\u0ae0\u0ae1\u0b05-\u0b0c\u0b0f\u0b10\u0b13-\u0b28\u0b2a-\u0b30\u0b32\u0b33\u0b35-\u0b39\u0b3d\u0b5c\u0b5d\u0b5f-\u0b61\u0b71\u0b83\u0b85-\u0b8a\u0b8e-\u0b90\u0b92-\u0b95\u0b99\u0b9a\u0b9c\u0b9e\u0b9f\u0ba3\u0ba4\u0ba8-\u0baa\u0bae-\u0bb9\u0bd0\u0c05-\u0c0c\u0c0e-\u0c10\u0c12-\u0c28\u0c2a-\u0c33\u0c35-\u0c39\u0c3d\u0c58\u0c59\u0c60\u0c61\u0c85-\u0c8c\u0c8e-\u0c90\u0c92-\u0ca8\u0caa-\u0cb3\u0cb5-\u0cb9\u0cbd\u0cde\u0ce0\u0ce1\u0cf1\u0cf2\u0d05-\u0d0c\u0d0e-\u0d10\u0d12-\u0d3a\u0d3d\u0d4e\u0d60\u0d61\u0d7a-\u0d7f\u0d85-\u0d96\u0d9a-\u0db1\u0db3-\u0dbb\u0dbd\u0dc0-\u0dc6\u0e01-\u0e30\u0e32\u0e33\u0e40-\u0e46\u0e81\u0e82\u0e84\u0e87\u0e88\u0e8a\u0e8d\u0e94-\u0e97\u0e99-\u0e9f\u0ea1-\u0ea3\u0ea5\u0ea7\u0eaa\u0eab\u0ead-\u0eb0\u0eb2\u0eb3\u0ebd\u0ec0-\u0ec4\u0ec6\u0edc-\u0edf\u0f00\u0f40-\u0f47\u0f49-\u0f6c\u0f88-\u0f8c\u1000-\u102a\u103f\u1050-\u1055\u105a-\u105d\u1061\u1065\u1066\u106e-\u1070\u1075-\u1081\u108e\u10a0-\u10c5\u10c7\u10cd\u10d0-\u10fa\u10fc-\u1248\u124a-\u124d\u1250-\u1256\u1258\u125a-\u125d\u1260-\u1288\u128a-\u128d\u1290-\u12b0\u12b2-\u12b5\u12b8-\u12be\u12c0\u12c2-\u12c5\u12c8-\u12d6\u12d8-\u1310\u1312-\u1315\u1318-\u135a\u1380-\u138f\u13a0-\u13f4\u1401-\u166c\u166f-\u167f\u1681-\u169a\u16a0-\u16ea\u16ee-\u16f0\u1700-\u170c\u170e-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176c\u176e-\u1770\u1780-\u17b3\u17d7\u17dc\u1820-\u1877\u1880-\u18a8\u18aa\u18b0-\u18f5\u1900-\u191c\u1950-\u196d\u1970-\u1974\u1980-\u19ab\u19c1-\u19c7\u1a00-\u1a16\u1a20-\u1a54\u1aa7\u1b05-\u1b33\u1b45-\u1b4b\u1b83-\u1ba0\u1bae\u1baf\u1bba-\u1be5\u1c00-\u1c23\u1c4d-\u1c4f\u1c5a-\u1c7d\u1ce9-\u1cec\u1cee-\u1cf1\u1cf5\u1cf6\u1d00-\u1dbf\u1e00-\u1f15\u1f18-\u1f1d\u1f20-\u1f45\u1f48-\u1f4d\u1f50-\u1f57\u1f59\u1f5b\u1f5d\u1f5f-\u1f7d\u1f80-\u1fb4\u1fb6-\u1fbc\u1fbe\u1fc2-\u1fc4\u1fc6-\u1fcc\u1fd0-\u1fd3\u1fd6-\u1fdb\u1fe0-\u1fec\u1ff2-\u1ff4\u1ff6-\u1ffc\u2071\u207f\u2090-\u209c\u2102\u2107\u210a-\u2113\u2115\u2119-\u211d\u2124\u2126\u2128\u212a-\u212d\u212f-\u2139\u213c-\u213f\u2145-\u2149\u214e\u2160-\u2188\u2c00-\u2c2e\u2c30-\u2c5e\u2c60-\u2ce4\u2ceb-\u2cee\u2cf2\u2cf3\u2d00-\u2d25\u2d27\u2d2d\u2d30-\u2d67\u2d6f\u2d80-\u2d96\u2da0-\u2da6\u2da8-\u2dae\u2db0-\u2db6\u2db8-\u2dbe\u2dc0-\u2dc6\u2dc8-\u2dce\u2dd0-\u2dd6\u2dd8-\u2dde\u2e2f\u3005-\u3007\u3021-\u3029\u3031-\u3035\u3038-\u303c\u3041-\u3096\u309d-\u309f\u30a1-\u30fa\u30fc-\u30ff\u3105-\u312d\u3131-\u318e\u31a0-\u31ba\u31f0-\u31ff\u3400-\u4db5\u4e00-\u9fcc\ua000-\ua48c\ua4d0-\ua4fd\ua500-\ua60c\ua610-\ua61f\ua62a\ua62b\ua640-\ua66e\ua67f-\ua697\ua6a0-\ua6ef\ua717-\ua71f\ua722-\ua788\ua78b-\ua78e\ua790-\ua793\ua7a0-\ua7aa\ua7f8-\ua801\ua803-\ua805\ua807-\ua80a\ua80c-\ua822\ua840-\ua873\ua882-\ua8b3\ua8f2-\ua8f7\ua8fb\ua90a-\ua925\ua930-\ua946\ua960-\ua97c\ua984-\ua9b2\ua9cf\uaa00-\uaa28\uaa40-\uaa42\uaa44-\uaa4b\uaa60-\uaa76\uaa7a\uaa80-\uaaaf\uaab1\uaab5\uaab6\uaab9-\uaabd\uaac0\uaac2\uaadb-\uaadd\uaae0-\uaaea\uaaf2-\uaaf4\uab01-\uab06\uab09-\uab0e\uab11-\uab16\uab20-\uab26\uab28-\uab2e\uabc0-\uabe2\uac00-\ud7a3\ud7b0-\ud7c6\ud7cb-\ud7fb\uf900-\ufa6d\ufa70-\ufad9\ufb00-\ufb06\ufb13-\ufb17\ufb1d\ufb1f-\ufb28\ufb2a-\ufb36\ufb38-\ufb3c\ufb3e\ufb40\ufb41\ufb43\ufb44\ufb46-\ufbb1\ufbd3-\ufd3d\ufd50-\ufd8f\ufd92-\ufdc7\ufdf0-\ufdfb\ufe70-\ufe74\ufe76-\ufefc\uff21-\uff3a\uff41-\uff5a\uff66-\uffbe\uffc2-\uffc7\uffca-\uffcf\uffd2-\uffd7\uffda-\uffdc";
  var nonASCIIidentifierChars = "\u0300-\u036f\u0483-\u0487\u0591-\u05bd\u05bf\u05c1\u05c2\u05c4\u05c5\u05c7\u0610-\u061a\u0620-\u0649\u0672-\u06d3\u06e7-\u06e8\u06fb-\u06fc\u0730-\u074a\u0800-\u0814\u081b-\u0823\u0825-\u0827\u0829-\u082d\u0840-\u0857\u08e4-\u08fe\u0900-\u0903\u093a-\u093c\u093e-\u094f\u0951-\u0957\u0962-\u0963\u0966-\u096f\u0981-\u0983\u09bc\u09be-\u09c4\u09c7\u09c8\u09d7\u09df-\u09e0\u0a01-\u0a03\u0a3c\u0a3e-\u0a42\u0a47\u0a48\u0a4b-\u0a4d\u0a51\u0a66-\u0a71\u0a75\u0a81-\u0a83\u0abc\u0abe-\u0ac5\u0ac7-\u0ac9\u0acb-\u0acd\u0ae2-\u0ae3\u0ae6-\u0aef\u0b01-\u0b03\u0b3c\u0b3e-\u0b44\u0b47\u0b48\u0b4b-\u0b4d\u0b56\u0b57\u0b5f-\u0b60\u0b66-\u0b6f\u0b82\u0bbe-\u0bc2\u0bc6-\u0bc8\u0bca-\u0bcd\u0bd7\u0be6-\u0bef\u0c01-\u0c03\u0c46-\u0c48\u0c4a-\u0c4d\u0c55\u0c56\u0c62-\u0c63\u0c66-\u0c6f\u0c82\u0c83\u0cbc\u0cbe-\u0cc4\u0cc6-\u0cc8\u0cca-\u0ccd\u0cd5\u0cd6\u0ce2-\u0ce3\u0ce6-\u0cef\u0d02\u0d03\u0d46-\u0d48\u0d57\u0d62-\u0d63\u0d66-\u0d6f\u0d82\u0d83\u0dca\u0dcf-\u0dd4\u0dd6\u0dd8-\u0ddf\u0df2\u0df3\u0e34-\u0e3a\u0e40-\u0e45\u0e50-\u0e59\u0eb4-\u0eb9\u0ec8-\u0ecd\u0ed0-\u0ed9\u0f18\u0f19\u0f20-\u0f29\u0f35\u0f37\u0f39\u0f41-\u0f47\u0f71-\u0f84\u0f86-\u0f87\u0f8d-\u0f97\u0f99-\u0fbc\u0fc6\u1000-\u1029\u1040-\u1049\u1067-\u106d\u1071-\u1074\u1082-\u108d\u108f-\u109d\u135d-\u135f\u170e-\u1710\u1720-\u1730\u1740-\u1750\u1772\u1773\u1780-\u17b2\u17dd\u17e0-\u17e9\u180b-\u180d\u1810-\u1819\u1920-\u192b\u1930-\u193b\u1951-\u196d\u19b0-\u19c0\u19c8-\u19c9\u19d0-\u19d9\u1a00-\u1a15\u1a20-\u1a53\u1a60-\u1a7c\u1a7f-\u1a89\u1a90-\u1a99\u1b46-\u1b4b\u1b50-\u1b59\u1b6b-\u1b73\u1bb0-\u1bb9\u1be6-\u1bf3\u1c00-\u1c22\u1c40-\u1c49\u1c5b-\u1c7d\u1cd0-\u1cd2\u1d00-\u1dbe\u1e01-\u1f15\u200c\u200d\u203f\u2040\u2054\u20d0-\u20dc\u20e1\u20e5-\u20f0\u2d81-\u2d96\u2de0-\u2dff\u3021-\u3028\u3099\u309a\ua640-\ua66d\ua674-\ua67d\ua69f\ua6f0-\ua6f1\ua7f8-\ua800\ua806\ua80b\ua823-\ua827\ua880-\ua881\ua8b4-\ua8c4\ua8d0-\ua8d9\ua8f3-\ua8f7\ua900-\ua909\ua926-\ua92d\ua930-\ua945\ua980-\ua983\ua9b3-\ua9c0\uaa00-\uaa27\uaa40-\uaa41\uaa4c-\uaa4d\uaa50-\uaa59\uaa7b\uaae0-\uaae9\uaaf2-\uaaf3\uabc0-\uabe1\uabec\uabed\uabf0-\uabf9\ufb20-\ufb28\ufe00-\ufe0f\ufe20-\ufe26\ufe33\ufe34\ufe4d-\ufe4f\uff10-\uff19\uff3f";
  var nonASCIIidentifierStart = new RegExp("[" + nonASCIIidentifierStartChars + "]");
  var nonASCIIidentifier = new RegExp("[" + nonASCIIidentifierStartChars + nonASCIIidentifierChars + "]");

  // Whether a single character denotes a newline.

  var newline = /[\n\r\u2028\u2029]/;

  // Matches a whole line break (where CRLF is considered a single
  // line break). Used to count lines.

  var lineBreak = /\r\n|[\n\r\u2028\u2029]/g;

  // Test whether a given character code starts an identifier.

  var isIdentifierStart = exports.isIdentifierStart = function(code) {
    if (code < 65) return code === 36;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123)return true;
    return code >= 0xaa && nonASCIIidentifierStart.test(String.fromCharCode(code));
  };

  // Test whether a given character is part of an identifier.

  var isIdentifierChar = exports.isIdentifierChar = function(code) {
    if (code < 48) return code === 36;
    if (code < 58) return true;
    if (code < 65) return false;
    if (code < 91) return true;
    if (code < 97) return code === 95;
    if (code < 123)return true;
    return code >= 0xaa && nonASCIIidentifier.test(String.fromCharCode(code));
  };

  // ## Tokenizer

  // These are used when `options.locations` is on, for the
  // `tokStartLoc` and `tokEndLoc` properties.

  function line_loc_t() {
    this.line = tokCurLine;
    this.column = tokPos - tokLineStart;
  }

  // Reset the token state. Used at the start of a parse.

  function initTokenState() {
    tokCurLine = 1;
    tokPos = tokLineStart = 0;
    tokRegexpAllowed = true;
    skipSpace();
  }

  // Called at the end of every token. Sets `tokEnd`, `tokVal`, and
  // `tokRegexpAllowed`, and skips the space after the token, so that
  // the next one's `tokStart` will point at the right position.

  function finishToken(type, val) {
    tokEnd = tokPos;
    if (options.locations) tokEndLoc = new line_loc_t;
    tokType = type;
    skipSpace();
    tokVal = val;
    tokRegexpAllowed = type.beforeExpr;
  }

  function skipBlockComment() {
    var startLoc = options.onComment && options.locations && new line_loc_t;
    var start = tokPos, end = input.indexOf("*/", tokPos += 2);
    if (end === -1) raise(tokPos - 2, "Unterminated comment");
    tokPos = end + 2;
    if (options.locations) {
      lineBreak.lastIndex = start;
      var match;
      while ((match = lineBreak.exec(input)) && match.index < tokPos) {
        ++tokCurLine;
        tokLineStart = match.index + match[0].length;
      }
    }
    if (options.onComment)
      options.onComment(true, input.slice(start + 2, end), start, tokPos,
                        startLoc, options.locations && new line_loc_t);
  }

  function skipLineComment() {
    var start = tokPos;
    var startLoc = options.onComment && options.locations && new line_loc_t;
    var ch = input.charCodeAt(tokPos+=2);
    while (tokPos < inputLen && ch !== 10 && ch !== 13 && ch !== 8232 && ch !== 8233) {
      ++tokPos;
      ch = input.charCodeAt(tokPos);
    }
    if (options.onComment)
      options.onComment(false, input.slice(start + 2, tokPos), start, tokPos,
                        startLoc, options.locations && new line_loc_t);
  }

  // Called at the start of the parse and after every token. Skips
  // whitespace and comments, and.

  function skipSpace() {
    while (tokPos < inputLen) {
      var ch = input.charCodeAt(tokPos);
      if (ch === 32) { // ' '
        ++tokPos;
      } else if (ch === 13) {
        ++tokPos;
        var next = input.charCodeAt(tokPos);
        if (next === 10) {
          ++tokPos;
        }
        if (options.locations) {
          ++tokCurLine;
          tokLineStart = tokPos;
        }
      } else if (ch === 10 || ch === 8232 || ch === 8233) {
        ++tokPos;
        if (options.locations) {
          ++tokCurLine;
          tokLineStart = tokPos;
        }
      } else if (ch > 8 && ch < 14) {
        ++tokPos;
      } else if (ch === 47) { // '/'
        var next = input.charCodeAt(tokPos + 1);
        if (next === 42) { // '*'
          skipBlockComment();
        } else if (next === 47) { // '/'
          skipLineComment();
        } else break;
      } else if (ch === 160) { // '\xa0'
        ++tokPos;
      } else if (ch >= 5760 && nonASCIIwhitespace.test(String.fromCharCode(ch))) {
        ++tokPos;
      } else {
        break;
      }
    }
  }

  // ### Token reading

  // This is the function that is called to fetch the next token. It
  // is somewhat obscure, because it works in character codes rather
  // than characters, and because operator parsing has been inlined
  // into it.
  //
  // All in the name of speed.
  //
  // The `forceRegexp` parameter is used in the one case where the
  // `tokRegexpAllowed` trick does not work. See `parseStatement`.

  function readToken_dot() {
    var next = input.charCodeAt(tokPos + 1);
    if (next >= 48 && next <= 57) return readNumber(true);
    ++tokPos;
    return finishToken(_dot);
  }

  function readToken_slash() { // '/'
    var next = input.charCodeAt(tokPos + 1);
    if (tokRegexpAllowed) {++tokPos; return readRegexp();}
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(_slash, 1);
  }

  function readToken_mult_modulo() { // '%*'
    var next = input.charCodeAt(tokPos + 1);
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(_multiplyModulo, 1);
  }

  function readToken_pipe_amp(code) { // '|&'
    var next = input.charCodeAt(tokPos + 1);
    if (next === code) return finishOp(code === 124 ? _logicalOR : _logicalAND, 2);
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(code === 124 ? _bitwiseOR : _bitwiseAND, 1);
  }

  function readToken_caret() { // '^'
    var next = input.charCodeAt(tokPos + 1);
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(_bitwiseXOR, 1);
  }

  function readToken_plus_min(code) { // '+-'
    var next = input.charCodeAt(tokPos + 1);
    if (next === code) {
      if (next == 45 && input.charCodeAt(tokPos + 2) == 62 &&
          newline.test(input.slice(lastEnd, tokPos))) {
        // A `-->` line comment
        tokPos += 3;
        skipLineComment();
        skipSpace();
        return readToken();
      }
      return finishOp(_incDec, 2);
    }
    if (next === 61) return finishOp(_assign, 2);
    return finishOp(_plusMin, 1);
  }

  function readToken_lt_gt(code) { // '<>'
    var next = input.charCodeAt(tokPos + 1);
    var size = 1;
    if (next === code) {
      size = code === 62 && input.charCodeAt(tokPos + 2) === 62 ? 3 : 2;
      if (input.charCodeAt(tokPos + size) === 61) return finishOp(_assign, size + 1);
      return finishOp(_bitShift, size);
    }
    if (next == 33 && code == 60 && input.charCodeAt(tokPos + 2) == 45 &&
        input.charCodeAt(tokPos + 3) == 45) {
      // `<!--`, an XML-style comment that should be interpreted as a line comment
      tokPos += 4;
      skipLineComment();
      skipSpace();
      return readToken();
    }
    if (next === 61)
      size = input.charCodeAt(tokPos + 2) === 61 ? 3 : 2;
    return finishOp(_relational, size);
  }

  function readToken_eq_excl(code) { // '=!'
    var next = input.charCodeAt(tokPos + 1);
    if (next === 61) return finishOp(_equality, input.charCodeAt(tokPos + 2) === 61 ? 3 : 2);
    return finishOp(code === 61 ? _eq : _prefix, 1);
  }

  function getTokenFromCode(code) {
    switch(code) {
      // The interpretation of a dot depends on whether it is followed
      // by a digit.
    case 46: // '.'
      return readToken_dot();

      // Punctuation tokens.
    case 40: ++tokPos; return finishToken(_parenL);
    case 41: ++tokPos; return finishToken(_parenR);
    case 59: ++tokPos; return finishToken(_semi);
    case 44: ++tokPos; return finishToken(_comma);
    case 91: ++tokPos; return finishToken(_bracketL);
    case 93: ++tokPos; return finishToken(_bracketR);
    case 123: ++tokPos; return finishToken(_braceL);
    case 125: ++tokPos; return finishToken(_braceR);
    case 58: ++tokPos; return finishToken(_colon);
    case 63: ++tokPos; return finishToken(_question);

      // '0x' is a hexadecimal number.
    case 48: // '0'
      var next = input.charCodeAt(tokPos + 1);
      if (next === 120 || next === 88) return readHexNumber();
      // Anything else beginning with a digit is an integer, octal
      // number, or float.
    case 49: case 50: case 51: case 52: case 53: case 54: case 55: case 56: case 57: // 1-9
      return readNumber(false);

      // Quotes produce strings.
    case 34: case 39: // '"', "'"
      return readString(code);

    // Operators are parsed inline in tiny state machines. '=' (61) is
    // often referred to. `finishOp` simply skips the amount of
    // characters it is given as second argument, and returns a token
    // of the type given by its first argument.

    case 47: // '/'
      return readToken_slash(code);

    case 37: case 42: // '%*'
      return readToken_mult_modulo();

    case 124: case 38: // '|&'
      return readToken_pipe_amp(code);

    case 94: // '^'
      return readToken_caret();

    case 43: case 45: // '+-'
      return readToken_plus_min(code);

    case 60: case 62: // '<>'
      return readToken_lt_gt(code);

    case 61: case 33: // '=!'
      return readToken_eq_excl(code);

    case 126: // '~'
      return finishOp(_prefix, 1);
    }

    return false;
  }

  function readToken(forceRegexp) {
    if (!forceRegexp) tokStart = tokPos;
    else tokPos = tokStart + 1;
    if (options.locations) tokStartLoc = new line_loc_t;
    if (forceRegexp) return readRegexp();
    if (tokPos >= inputLen) return finishToken(_eof);

    var code = input.charCodeAt(tokPos);
    // Identifier or keyword. '\uXXXX' sequences are allowed in
    // identifiers, so '\' also dispatches to that.
    if (isIdentifierStart(code) || code === 92 /* '\' */) return readWord();

    var tok = getTokenFromCode(code);

    if (tok === false) {
      // If we are here, we either found a non-ASCII identifier
      // character, or something that's entirely disallowed.
      var ch = String.fromCharCode(code);
      if (ch === "\\" || nonASCIIidentifierStart.test(ch)) return readWord();
      raise(tokPos, "Unexpected character '" + ch + "'");
    }
    return tok;
  }

  function finishOp(type, size) {
    var str = input.slice(tokPos, tokPos + size);
    tokPos += size;
    finishToken(type, str);
  }

  // Parse a regular expression. Some context-awareness is necessary,
  // since a '/' inside a '[]' set does not end the expression.

  function readRegexp() {
    var content = "", escaped, inClass, start = tokPos;
    for (;;) {
      if (tokPos >= inputLen) raise(start, "Unterminated regular expression");
      var ch = input.charAt(tokPos);
      if (newline.test(ch)) raise(start, "Unterminated regular expression");
      if (!escaped) {
        if (ch === "[") inClass = true;
        else if (ch === "]" && inClass) inClass = false;
        else if (ch === "/" && !inClass) break;
        escaped = ch === "\\";
      } else escaped = false;
      ++tokPos;
    }
    var content = input.slice(start, tokPos);
    ++tokPos;
    // Need to use `readWord1` because '\uXXXX' sequences are allowed
    // here (don't ask).
    var mods = readWord1();
    if (mods && !/^[gmsiy]*$/.test(mods)) raise(start, "Invalid regexp flag");
    return finishToken(_regexp, new RegExp(content, mods));
  }

  // Read an integer in the given radix. Return null if zero digits
  // were read, the integer value otherwise. When `len` is given, this
  // will return `null` unless the integer has exactly `len` digits.

  function readInt(radix, len) {
    var start = tokPos, total = 0;
    for (var i = 0, e = len == null ? Infinity : len; i < e; ++i) {
      var code = input.charCodeAt(tokPos), val;
      if (code >= 97) val = code - 97 + 10; // a
      else if (code >= 65) val = code - 65 + 10; // A
      else if (code >= 48 && code <= 57) val = code - 48; // 0-9
      else val = Infinity;
      if (val >= radix) break;
      ++tokPos;
      total = total * radix + val;
    }
    if (tokPos === start || len != null && tokPos - start !== len) return null;

    return total;
  }

  function readHexNumber() {
    tokPos += 2; // 0x
    var val = readInt(16);
    if (val == null) raise(tokStart + 2, "Expected hexadecimal number");
    if (isIdentifierStart(input.charCodeAt(tokPos))) raise(tokPos, "Identifier directly after number");
    return finishToken(_num, val);
  }

  // Read an integer, octal integer, or floating-point number.

  function readNumber(startsWithDot) {
    var start = tokPos, isFloat = false, octal = input.charCodeAt(tokPos) === 48;
    if (!startsWithDot && readInt(10) === null) raise(start, "Invalid number");
    if (input.charCodeAt(tokPos) === 46) {
      ++tokPos;
      readInt(10);
      isFloat = true;
    }
    var next = input.charCodeAt(tokPos);
    if (next === 69 || next === 101) { // 'eE'
      next = input.charCodeAt(++tokPos);
      if (next === 43 || next === 45) ++tokPos; // '+-'
      if (readInt(10) === null) raise(start, "Invalid number");
      isFloat = true;
    }
    if (isIdentifierStart(input.charCodeAt(tokPos))) raise(tokPos, "Identifier directly after number");

    var str = input.slice(start, tokPos), val;
    if (isFloat) val = parseFloat(str);
    else if (!octal || str.length === 1) val = parseInt(str, 10);
    else if (/[89]/.test(str) || strict) raise(start, "Invalid number");
    else val = parseInt(str, 8);
    return finishToken(_num, val);
  }

  // Read a string value, interpreting backslash-escapes.

  function readString(quote) {
    tokPos++;
    var out = "";
    for (;;) {
      if (tokPos >= inputLen) raise(tokStart, "Unterminated string constant");
      var ch = input.charCodeAt(tokPos);
      if (ch === quote) {
        ++tokPos;
        return finishToken(_string, out);
      }
      if (ch === 92) { // '\'
        ch = input.charCodeAt(++tokPos);
        var octal = /^[0-7]+/.exec(input.slice(tokPos, tokPos + 3));
        if (octal) octal = octal[0];
        while (octal && parseInt(octal, 8) > 255) octal = octal.slice(0, -1);
        if (octal === "0") octal = null;
        ++tokPos;
        if (octal) {
          if (strict) raise(tokPos - 2, "Octal literal in strict mode");
          out += String.fromCharCode(parseInt(octal, 8));
          tokPos += octal.length - 1;
        } else {
          switch (ch) {
          case 110: out += "\n"; break; // 'n' -> '\n'
          case 114: out += "\r"; break; // 'r' -> '\r'
          case 120: out += String.fromCharCode(readHexChar(2)); break; // 'x'
          case 117: out += String.fromCharCode(readHexChar(4)); break; // 'u'
          case 85: out += String.fromCharCode(readHexChar(8)); break; // 'U'
          case 116: out += "\t"; break; // 't' -> '\t'
          case 98: out += "\b"; break; // 'b' -> '\b'
          case 118: out += "\u000b"; break; // 'v' -> '\u000b'
          case 102: out += "\f"; break; // 'f' -> '\f'
          case 48: out += "\0"; break; // 0 -> '\0'
          case 13: if (input.charCodeAt(tokPos) === 10) ++tokPos; // '\r\n'
          case 10: // ' \n'
            if (options.locations) { tokLineStart = tokPos; ++tokCurLine; }
            break;
          default: out += String.fromCharCode(ch); break;
          }
        }
      } else {
        if (ch === 13 || ch === 10 || ch === 8232 || ch === 8233) raise(tokStart, "Unterminated string constant");
        out += String.fromCharCode(ch); // '\'
        ++tokPos;
      }
    }
  }

  // Used to read character escape sequences ('\x', '\u', '\U').

  function readHexChar(len) {
    var n = readInt(16, len);
    if (n === null) raise(tokStart, "Bad character escape sequence");
    return n;
  }

  // Used to signal to callers of `readWord1` whether the word
  // contained any escape sequences. This is needed because words with
  // escape sequences must not be interpreted as keywords.

  var containsEsc;

  // Read an identifier, and return it as a string. Sets `containsEsc`
  // to whether the word contained a '\u' escape.
  //
  // Only builds up the word character-by-character when it actually
  // containeds an escape, as a micro-optimization.

  function readWord1() {
    containsEsc = false;
    var word, first = true, start = tokPos;
    for (;;) {
      var ch = input.charCodeAt(tokPos);
      if (isIdentifierChar(ch)) {
        if (containsEsc) word += input.charAt(tokPos);
        ++tokPos;
      } else if (ch === 92) { // "\"
        if (!containsEsc) word = input.slice(start, tokPos);
        containsEsc = true;
        if (input.charCodeAt(++tokPos) != 117) // "u"
          raise(tokPos, "Expecting Unicode escape sequence \\uXXXX");
        ++tokPos;
        var esc = readHexChar(4);
        var escStr = String.fromCharCode(esc);
        if (!escStr) raise(tokPos - 1, "Invalid Unicode escape");
        if (!(first ? isIdentifierStart(esc) : isIdentifierChar(esc)))
          raise(tokPos - 4, "Invalid Unicode escape");
        word += escStr;
      } else {
        break;
      }
      first = false;
    }
    return containsEsc ? word : input.slice(start, tokPos);
  }

  // Read an identifier or keyword token. Will check for reserved
  // words when necessary.

  function readWord() {
    var word = readWord1();
    var type = _name;
    if (!containsEsc) {
      if (isKeyword(word)) type = keywordTypes[word];
      else if (options.forbidReserved &&
               (options.ecmaVersion === 3 ? isReservedWord3 : isReservedWord5)(word) ||
               strict && isStrictReservedWord(word))
        raise(tokStart, "The keyword '" + word + "' is reserved");
    }
    return finishToken(type, word);
  }

  // ## Parser

  // A recursive descent parser operates by defining functions for all
  // syntactic elements, and recursively calling those, each function
  // advancing the input stream and returning an AST node. Precedence
  // of constructs (for example, the fact that `!x[1]` means `!(x[1])`
  // instead of `(!x)[1]` is handled by the fact that the parser
  // function that parses unary prefix operators is called first, and
  // in turn calls the function that parses `[]` subscripts — that
  // way, it'll receive the node for `x[1]` already parsed, and wraps
  // *that* in the unary operator node.
  //
  // Acorn uses an [operator precedence parser][opp] to handle binary
  // operator precedence, because it is much more compact than using
  // the technique outlined above, which uses different, nesting
  // functions to specify precedence, for all of the ten binary
  // precedence levels that JavaScript defines.
  //
  // [opp]: http://en.wikipedia.org/wiki/Operator-precedence_parser

  // ### Parser utilities

  // Continue to the next token.

  function next() {
    lastStart = tokStart;
    lastEnd = tokEnd;
    lastEndLoc = tokEndLoc;
    readToken();
  }

  // Enter strict mode. Re-reads the next token to please pedantic
  // tests ("use strict"; 010; -- should fail).

  function setStrict(strct) {
    strict = strct;
    tokPos = lastEnd;
    if (options.locations) {
      while (tokPos < tokLineStart) {
        tokLineStart = input.lastIndexOf("\n", tokLineStart - 2) + 1;
        --tokCurLine;
      }
    }
    skipSpace();
    readToken();
  }

  // Start an AST node, attaching a start offset.

  function node_t() {
    this.type = null;
    this.start = tokStart;
    this.end = null;
  }

  function node_loc_t() {
    this.start = tokStartLoc;
    this.end = null;
    if (sourceFile !== null) this.source = sourceFile;
  }

  function startNode() {
    var node = new node_t();
    if (options.locations)
      node.loc = new node_loc_t();
    if (options.directSourceFile)
      node.sourceFile = options.directSourceFile;
    if (options.ranges)
      node.range = [tokStart, 0];
    return node;
  }

  // Start a node whose start offset information should be based on
  // the start of another node. For example, a binary operator node is
  // only started after its left-hand side has already been parsed.

  function startNodeFrom(other) {
    var node = new node_t();
    node.start = other.start;
    if (options.locations) {
      node.loc = new node_loc_t();
      node.loc.start = other.loc.start;
    }
    if (options.ranges)
      node.range = [other.range[0], 0];

    return node;
  }

  // Finish an AST node, adding `type` and `end` properties.

  function finishNode(node, type) {
    node.type = type;
    node.end = lastEnd;
    if (options.locations)
      node.loc.end = lastEndLoc;
    if (options.ranges)
      node.range[1] = lastEnd;
    return node;
  }

  // Test whether a statement node is the string literal `"use strict"`.

  function isUseStrict(stmt) {
    return options.ecmaVersion >= 5 && stmt.type === "ExpressionStatement" &&
      stmt.expression.type === "Literal" && stmt.expression.value === "use strict";
  }

  // Predicate that tests whether the next token is of the given
  // type, and if yes, consumes it as a side effect.

  function eat(type) {
    if (tokType === type) {
      next();
      return true;
    }
  }

  // Test whether a semicolon can be inserted at the current position.

  function canInsertSemicolon() {
    return !options.strictSemicolons &&
      (tokType === _eof || tokType === _braceR || newline.test(input.slice(lastEnd, tokStart)));
  }

  // Consume a semicolon, or, failing that, see if we are allowed to
  // pretend that there is a semicolon at this position.

  function semicolon() {
    if (!eat(_semi) && !canInsertSemicolon()) unexpected();
  }

  // Expect a token of a given type. If found, consume it, otherwise,
  // raise an unexpected token error.

  function expect(type) {
    if (tokType === type) next();
    else unexpected();
  }

  // Raise an unexpected token error.

  function unexpected() {
    raise(tokStart, "Unexpected token");
  }

  // Verify that a node is an lval — something that can be assigned
  // to.

  function checkLVal(expr) {
    if (expr.type !== "Identifier" && expr.type !== "MemberExpression")
      raise(expr.start, "Assigning to rvalue");
    if (strict && expr.type === "Identifier" && isStrictBadIdWord(expr.name))
      raise(expr.start, "Assigning to " + expr.name + " in strict mode");
  }

  // ### Statement parsing

  // Parse a program. Initializes the parser, reads any number of
  // statements, and wraps them in a Program node.  Optionally takes a
  // `program` argument.  If present, the statements will be appended
  // to its body instead of creating a new node.

  function parseTopLevel(program) {
    lastStart = lastEnd = tokPos;
    if (options.locations) lastEndLoc = new line_loc_t;
    inFunction = strict = null;
    labels = [];
    readToken();

    var node = program || startNode(), first = true;
    if (!program) node.body = [];
    while (tokType !== _eof) {
      var stmt = parseStatement();
      node.body.push(stmt);
      if (first && isUseStrict(stmt)) setStrict(true);
      first = false;
    }
    return finishNode(node, "Program");
  }

  var loopLabel = {kind: "loop"}, switchLabel = {kind: "switch"};

  // Parse a single statement.
  //
  // If expecting a statement and finding a slash operator, parse a
  // regular expression literal. This is to handle cases like
  // `if (foo) /blah/.exec(foo);`, where looking at the previous token
  // does not help.

  function parseStatement() {
    if (tokType === _slash || tokType === _assign && tokVal == "/=")
      readToken(true);

    var starttype = tokType, node = startNode();

    // Most types of statements are recognized by the keyword they
    // start with. Many are trivial to parse, some require a bit of
    // complexity.

    switch (starttype) {
    case _break: case _continue:
      next();
      var isBreak = starttype === _break;
      if (eat(_semi) || canInsertSemicolon()) node.label = null;
      else if (tokType !== _name) unexpected();
      else {
        node.label = parseIdent();
        semicolon();
      }

      // Verify that there is an actual destination to break or
      // continue to.
      for (var i = 0; i < labels.length; ++i) {
        var lab = labels[i];
        if (node.label == null || lab.name === node.label.name) {
          if (lab.kind != null && (isBreak || lab.kind === "loop")) break;
          if (node.label && isBreak) break;
        }
      }
      if (i === labels.length) raise(node.start, "Unsyntactic " + starttype.keyword);
      return finishNode(node, isBreak ? "BreakStatement" : "ContinueStatement");

    case _debugger:
      next();
      semicolon();
      return finishNode(node, "DebuggerStatement");

    case _do:
      next();
      labels.push(loopLabel);
      node.body = parseStatement();
      labels.pop();
      expect(_while);
      node.test = parseParenExpression();
      semicolon();
      return finishNode(node, "DoWhileStatement");

      // Disambiguating between a `for` and a `for`/`in` loop is
      // non-trivial. Basically, we have to parse the init `var`
      // statement or expression, disallowing the `in` operator (see
      // the second parameter to `parseExpression`), and then check
      // whether the next token is `in`. When there is no init part
      // (semicolon immediately after the opening parenthesis), it is
      // a regular `for` loop.

    case _for:
      next();
      labels.push(loopLabel);
      expect(_parenL);
      if (tokType === _semi) return parseFor(node, null);
      if (tokType === _var) {
        var init = startNode();
        next();
        parseVar(init, true);
        finishNode(init, "VariableDeclaration");
        if (init.declarations.length === 1 && eat(_in))
          return parseForIn(node, init);
        return parseFor(node, init);
      }
      var init = parseExpression(false, true);
      if (eat(_in)) {checkLVal(init); return parseForIn(node, init);}
      return parseFor(node, init);

    case _function:
      next();
      return parseFunction(node, true);

    case _if:
      next();
      node.test = parseParenExpression();
      node.consequent = parseStatement();
      node.alternate = eat(_else) ? parseStatement() : null;
      return finishNode(node, "IfStatement");

    case _return:
      if (!inFunction) raise(tokStart, "'return' outside of function");
      next();

      // In `return` (and `break`/`continue`), the keywords with
      // optional arguments, we eagerly look for a semicolon or the
      // possibility to insert one.

      if (eat(_semi) || canInsertSemicolon()) node.argument = null;
      else { node.argument = parseExpression(); semicolon(); }
      return finishNode(node, "ReturnStatement");

    case _switch:
      next();
      node.discriminant = parseParenExpression();
      node.cases = [];
      expect(_braceL);
      labels.push(switchLabel);

      // Statements under must be grouped (by label) in SwitchCase
      // nodes. `cur` is used to keep the node that we are currently
      // adding statements to.

      for (var cur, sawDefault; tokType != _braceR;) {
        if (tokType === _case || tokType === _default) {
          var isCase = tokType === _case;
          if (cur) finishNode(cur, "SwitchCase");
          node.cases.push(cur = startNode());
          cur.consequent = [];
          next();
          if (isCase) cur.test = parseExpression();
          else {
            if (sawDefault) raise(lastStart, "Multiple default clauses"); sawDefault = true;
            cur.test = null;
          }
          expect(_colon);
        } else {
          if (!cur) unexpected();
          cur.consequent.push(parseStatement());
        }
      }
      if (cur) finishNode(cur, "SwitchCase");
      next(); // Closing brace
      labels.pop();
      return finishNode(node, "SwitchStatement");

    case _throw:
      next();
      if (newline.test(input.slice(lastEnd, tokStart)))
        raise(lastEnd, "Illegal newline after throw");
      node.argument = parseExpression();
      semicolon();
      return finishNode(node, "ThrowStatement");

    case _try:
      next();
      node.block = parseBlock();
      node.handler = null;
      if (tokType === _catch) {
        var clause = startNode();
        next();
        expect(_parenL);
        clause.param = parseIdent();
        if (strict && isStrictBadIdWord(clause.param.name))
          raise(clause.param.start, "Binding " + clause.param.name + " in strict mode");
        expect(_parenR);
        clause.guard = null;
        clause.body = parseBlock();
        node.handler = finishNode(clause, "CatchClause");
      }
      node.guardedHandlers = empty;
      node.finalizer = eat(_finally) ? parseBlock() : null;
      if (!node.handler && !node.finalizer)
        raise(node.start, "Missing catch or finally clause");
      return finishNode(node, "TryStatement");

    case _var:
      next();
      parseVar(node);
      semicolon();
      return finishNode(node, "VariableDeclaration");

    case _while:
      next();
      node.test = parseParenExpression();
      labels.push(loopLabel);
      node.body = parseStatement();
      labels.pop();
      return finishNode(node, "WhileStatement");

    case _with:
      if (strict) raise(tokStart, "'with' in strict mode");
      next();
      node.object = parseParenExpression();
      node.body = parseStatement();
      return finishNode(node, "WithStatement");

    case _braceL:
      return parseBlock();

    case _semi:
      next();
      return finishNode(node, "EmptyStatement");

      // If the statement does not start with a statement keyword or a
      // brace, it's an ExpressionStatement or LabeledStatement. We
      // simply start parsing an expression, and afterwards, if the
      // next token is a colon and the expression was a simple
      // Identifier node, we switch to interpreting it as a label.

    default:
      var maybeName = tokVal, expr = parseExpression();
      if (starttype === _name && expr.type === "Identifier" && eat(_colon)) {
        for (var i = 0; i < labels.length; ++i)
          if (labels[i].name === maybeName) raise(expr.start, "Label '" + maybeName + "' is already declared");
        var kind = tokType.isLoop ? "loop" : tokType === _switch ? "switch" : null;
        labels.push({name: maybeName, kind: kind});
        node.body = parseStatement();
        labels.pop();
        node.label = expr;
        return finishNode(node, "LabeledStatement");
      } else {
        node.expression = expr;
        semicolon();
        return finishNode(node, "ExpressionStatement");
      }
    }
  }

  // Used for constructs like `switch` and `if` that insist on
  // parentheses around their expression.

  function parseParenExpression() {
    expect(_parenL);
    var val = parseExpression();
    expect(_parenR);
    return val;
  }

  // Parse a semicolon-enclosed block of statements, handling `"use
  // strict"` declarations when `allowStrict` is true (used for
  // function bodies).

  function parseBlock(allowStrict) {
    var node = startNode(), first = true, strict = false, oldStrict;
    node.body = [];
    expect(_braceL);
    while (!eat(_braceR)) {
      var stmt = parseStatement();
      node.body.push(stmt);
      if (first && allowStrict && isUseStrict(stmt)) {
        oldStrict = strict;
        setStrict(strict = true);
      }
      first = false;
    }
    if (strict && !oldStrict) setStrict(false);
    return finishNode(node, "BlockStatement");
  }

  // Parse a regular `for` loop. The disambiguation code in
  // `parseStatement` will already have parsed the init statement or
  // expression.

  function parseFor(node, init) {
    node.init = init;
    expect(_semi);
    node.test = tokType === _semi ? null : parseExpression();
    expect(_semi);
    node.update = tokType === _parenR ? null : parseExpression();
    expect(_parenR);
    node.body = parseStatement();
    labels.pop();
    return finishNode(node, "ForStatement");
  }

  // Parse a `for`/`in` loop.

  function parseForIn(node, init) {
    node.left = init;
    node.right = parseExpression();
    expect(_parenR);
    node.body = parseStatement();
    labels.pop();
    return finishNode(node, "ForInStatement");
  }

  // Parse a list of variable declarations.

  function parseVar(node, noIn) {
    node.declarations = [];
    node.kind = "var";
    for (;;) {
      var decl = startNode();
      decl.id = parseIdent();
      if (strict && isStrictBadIdWord(decl.id.name))
        raise(decl.id.start, "Binding " + decl.id.name + " in strict mode");
      decl.init = eat(_eq) ? parseExpression(true, noIn) : null;
      node.declarations.push(finishNode(decl, "VariableDeclarator"));
      if (!eat(_comma)) break;
    }
    return node;
  }

  // ### Expression parsing

  // These nest, from the most general expression type at the top to
  // 'atomic', nondivisible expression types at the bottom. Most of
  // the functions will simply let the function(s) below them parse,
  // and, *if* the syntactic construct they handle is present, wrap
  // the AST node that the inner parser gave them in another node.

  // Parse a full expression. The arguments are used to forbid comma
  // sequences (in argument lists, array literals, or object literals)
  // or the `in` operator (in for loops initalization expressions).

  function parseExpression(noComma, noIn) {
    var expr = parseMaybeAssign(noIn);
    if (!noComma && tokType === _comma) {
      var node = startNodeFrom(expr);
      node.expressions = [expr];
      while (eat(_comma)) node.expressions.push(parseMaybeAssign(noIn));
      return finishNode(node, "SequenceExpression");
    }
    return expr;
  }

  // Parse an assignment expression. This includes applications of
  // operators like `+=`.

  function parseMaybeAssign(noIn) {
    var left = parseMaybeConditional(noIn);
    if (tokType.isAssign) {
      var node = startNodeFrom(left);
      node.operator = tokVal;
      node.left = left;
      next();
      node.right = parseMaybeAssign(noIn);
      checkLVal(left);
      return finishNode(node, "AssignmentExpression");
    }
    return left;
  }

  // Parse a ternary conditional (`?:`) operator.

  function parseMaybeConditional(noIn) {
    var expr = parseExprOps(noIn);
    if (eat(_question)) {
      var node = startNodeFrom(expr);
      node.test = expr;
      node.consequent = parseExpression(true);
      expect(_colon);
      node.alternate = parseExpression(true, noIn);
      return finishNode(node, "ConditionalExpression");
    }
    return expr;
  }

  // Start the precedence parser.

  function parseExprOps(noIn) {
    return parseExprOp(parseMaybeUnary(), -1, noIn);
  }

  // Parse binary operators with the operator precedence parsing
  // algorithm. `left` is the left-hand side of the operator.
  // `minPrec` provides context that allows the function to stop and
  // defer further parser to one of its callers when it encounters an
  // operator that has a lower precedence than the set it is parsing.

  function parseExprOp(left, minPrec, noIn) {
    var prec = tokType.binop;
    if (prec != null && (!noIn || tokType !== _in)) {
      if (prec > minPrec) {
        var node = startNodeFrom(left);
        node.left = left;
        node.operator = tokVal;
        var op = tokType;
        next();
        node.right = parseExprOp(parseMaybeUnary(), prec, noIn);
        var exprNode = finishNode(node, (op === _logicalOR || op === _logicalAND) ? "LogicalExpression" : "BinaryExpression");
        return parseExprOp(exprNode, minPrec, noIn);
      }
    }
    return left;
  }

  // Parse unary operators, both prefix and postfix.

  function parseMaybeUnary() {
    if (tokType.prefix) {
      var node = startNode(), update = tokType.isUpdate;
      node.operator = tokVal;
      node.prefix = true;
      tokRegexpAllowed = true;
      next();
      node.argument = parseMaybeUnary();
      if (update) checkLVal(node.argument);
      else if (strict && node.operator === "delete" &&
               node.argument.type === "Identifier")
        raise(node.start, "Deleting local variable in strict mode");
      return finishNode(node, update ? "UpdateExpression" : "UnaryExpression");
    }
    var expr = parseExprSubscripts();
    while (tokType.postfix && !canInsertSemicolon()) {
      var node = startNodeFrom(expr);
      node.operator = tokVal;
      node.prefix = false;
      node.argument = expr;
      checkLVal(expr);
      next();
      expr = finishNode(node, "UpdateExpression");
    }
    return expr;
  }

  // Parse call, dot, and `[]`-subscript expressions.

  function parseExprSubscripts() {
    return parseSubscripts(parseExprAtom());
  }

  function parseSubscripts(base, noCalls) {
    if (eat(_dot)) {
      var node = startNodeFrom(base);
      node.object = base;
      node.property = parseIdent(true);
      node.computed = false;
      return parseSubscripts(finishNode(node, "MemberExpression"), noCalls);
    } else if (eat(_bracketL)) {
      var node = startNodeFrom(base);
      node.object = base;
      node.property = parseExpression();
      node.computed = true;
      expect(_bracketR);
      return parseSubscripts(finishNode(node, "MemberExpression"), noCalls);
    } else if (!noCalls && eat(_parenL)) {
      var node = startNodeFrom(base);
      node.callee = base;
      node.arguments = parseExprList(_parenR, false);
      return parseSubscripts(finishNode(node, "CallExpression"), noCalls);
    } else return base;
  }

  // Parse an atomic expression — either a single token that is an
  // expression, an expression started by a keyword like `function` or
  // `new`, or an expression wrapped in punctuation like `()`, `[]`,
  // or `{}`.

  function parseExprAtom() {
    switch (tokType) {
    case _this:
      var node = startNode();
      next();
      return finishNode(node, "ThisExpression");
    case _name:
      return parseIdent();
    case _num: case _string: case _regexp:
      var node = startNode();
      node.value = tokVal;
      node.raw = input.slice(tokStart, tokEnd);
      next();
      return finishNode(node, "Literal");

    case _null: case _true: case _false:
      var node = startNode();
      node.value = tokType.atomValue;
      node.raw = tokType.keyword;
      next();
      return finishNode(node, "Literal");

    case _parenL:
      var tokStartLoc1 = tokStartLoc, tokStart1 = tokStart;
      next();
      var val = parseExpression();
      val.start = tokStart1;
      val.end = tokEnd;
      if (options.locations) {
        val.loc.start = tokStartLoc1;
        val.loc.end = tokEndLoc;
      }
      if (options.ranges)
        val.range = [tokStart1, tokEnd];
      expect(_parenR);
      return val;

    case _bracketL:
      var node = startNode();
      next();
      node.elements = parseExprList(_bracketR, true, true);
      return finishNode(node, "ArrayExpression");

    case _braceL:
      return parseObj();

    case _function:
      var node = startNode();
      next();
      return parseFunction(node, false);

    case _new:
      return parseNew();

    default:
      unexpected();
    }
  }

  // New's precedence is slightly tricky. It must allow its argument
  // to be a `[]` or dot subscript expression, but not a call — at
  // least, not without wrapping it in parentheses. Thus, it uses the

  function parseNew() {
    var node = startNode();
    next();
    node.callee = parseSubscripts(parseExprAtom(), true);
    if (eat(_parenL)) node.arguments = parseExprList(_parenR, false);
    else node.arguments = empty;
    return finishNode(node, "NewExpression");
  }

  // Parse an object literal.

  function parseObj() {
    var node = startNode(), first = true, sawGetSet = false;
    node.properties = [];
    next();
    while (!eat(_braceR)) {
      if (!first) {
        expect(_comma);
        if (options.allowTrailingCommas && eat(_braceR)) break;
      } else first = false;

      var prop = {key: parsePropertyName()}, isGetSet = false, kind;
      if (eat(_colon)) {
        prop.value = parseExpression(true);
        kind = prop.kind = "init";
      } else if (options.ecmaVersion >= 5 && prop.key.type === "Identifier" &&
                 (prop.key.name === "get" || prop.key.name === "set")) {
        isGetSet = sawGetSet = true;
        kind = prop.kind = prop.key.name;
        prop.key = parsePropertyName();
        if (tokType !== _parenL) unexpected();
        prop.value = parseFunction(startNode(), false);
      } else unexpected();

      // getters and setters are not allowed to clash — either with
      // each other or with an init property — and in strict mode,
      // init properties are also not allowed to be repeated.

      if (prop.key.type === "Identifier" && (strict || sawGetSet)) {
        for (var i = 0; i < node.properties.length; ++i) {
          var other = node.properties[i];
          if (other.key.name === prop.key.name) {
            var conflict = kind == other.kind || isGetSet && other.kind === "init" ||
              kind === "init" && (other.kind === "get" || other.kind === "set");
            if (conflict && !strict && kind === "init" && other.kind === "init") conflict = false;
            if (conflict) raise(prop.key.start, "Redefinition of property");
          }
        }
      }
      node.properties.push(prop);
    }
    return finishNode(node, "ObjectExpression");
  }

  function parsePropertyName() {
    if (tokType === _num || tokType === _string) return parseExprAtom();
    return parseIdent(true);
  }

  // Parse a function declaration or literal (depending on the
  // `isStatement` parameter).

  function parseFunction(node, isStatement) {
    if (tokType === _name) node.id = parseIdent();
    else if (isStatement) unexpected();
    else node.id = null;
    node.params = [];
    var first = true;
    expect(_parenL);
    while (!eat(_parenR)) {
      if (!first) expect(_comma); else first = false;
      node.params.push(parseIdent());
    }

    // Start a new scope with regard to labels and the `inFunction`
    // flag (restore them to their old value afterwards).
    var oldInFunc = inFunction, oldLabels = labels;
    inFunction = true; labels = [];
    node.body = parseBlock(true);
    inFunction = oldInFunc; labels = oldLabels;

    // If this is a strict mode function, verify that argument names
    // are not repeated, and it does not try to bind the words `eval`
    // or `arguments`.
    if (strict || node.body.body.length && isUseStrict(node.body.body[0])) {
      for (var i = node.id ? -1 : 0; i < node.params.length; ++i) {
        var id = i < 0 ? node.id : node.params[i];
        if (isStrictReservedWord(id.name) || isStrictBadIdWord(id.name))
          raise(id.start, "Defining '" + id.name + "' in strict mode");
        if (i >= 0) for (var j = 0; j < i; ++j) if (id.name === node.params[j].name)
          raise(id.start, "Argument name clash in strict mode");
      }
    }

    return finishNode(node, isStatement ? "FunctionDeclaration" : "FunctionExpression");
  }

  // Parses a comma-separated list of expressions, and returns them as
  // an array. `close` is the token type that ends the list, and
  // `allowEmpty` can be turned on to allow subsequent commas with
  // nothing in between them to be parsed as `null` (which is needed
  // for array literals).

  function parseExprList(close, allowTrailingComma, allowEmpty) {
    var elts = [], first = true;
    while (!eat(close)) {
      if (!first) {
        expect(_comma);
        if (allowTrailingComma && options.allowTrailingCommas && eat(close)) break;
      } else first = false;

      if (allowEmpty && tokType === _comma) elts.push(null);
      else elts.push(parseExpression(true));
    }
    return elts;
  }

  // Parse the next token as an identifier. If `liberal` is true (used
  // when parsing properties), it will also convert keywords into
  // identifiers.

  function parseIdent(liberal) {
    var node = startNode();
    node.name = tokType === _name ? tokVal : (liberal && !options.forbidReserved && tokType.keyword) || unexpected();
    tokRegexpAllowed = false;
    next();
    return finishNode(node, "Identifier");
  }

});

},{}],11:[function(require,module,exports){
(function() {
  module.exports = {
    android: {
      prefix: "-webkit-",
      minor: true,
      versions: [4.4, 4.3, 4.2, 4.1, 4, 3, 2.3, 2.2, 2.1],
      popularity: [0.0894926, 0.74151, 0.74151, 2.29485, 1.0803, 0.00639233, 1.35517, 0.0831003, 0.0255693]
    },
    bb: {
      prefix: "-webkit-",
      minor: true,
      versions: [10, 7],
      popularity: [0, 0.153316]
    },
    chrome: {
      prefix: "-webkit-",
      future: [35, 34, 33],
      versions: [32, 31, 30, 29, 28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4],
      popularity: [15.5204, 15.3756, 0.411642, 0.480249, 0.274428, 0.312543, 0.221067, 0.121968, 0.068607, 0.083853, 0.121968, 0.480249, 0.045738, 0.038115, 0.099099, 0.030492, 0.038115, 0.068607, 0.045738, 0.053361, 0.060984, 0.121968, 0.038115, 0.015246, 0.022869, 0.022869, 0.030492, 0.022869, 0.022869]
    },
    ff: {
      prefix: "-moz-",
      future: [30, 29, 28],
      versions: [27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3.6, 3.5, 3, 2],
      popularity: [0.472626, 11.9757, 0.411642, 0.266805, 0.15246, 0.137214, 0.15246, 0.114345, 0.106722, 0.099099, 0.137214, 0.160083, 0.099099, 0.07623, 0.083853, 0.175329, 0.07623, 0.106722, 0.045738, 0.068607, 0.030492, 0.045738, 0.038115, 0.060984, 0.251559, 0.038115, 0.091476, 0.015246]
    },
    ie: {
      prefix: "-ms-",
      versions: [11, 10, 9, 8, 7, 6, 5.5],
      popularity: [6.40778, 3.74183, 3.18016, 5.65625, 0.213593, 0.28479, 0.009298]
    },
    ios: {
      prefix: "-webkit-",
      versions: [7, 6.1, 6, 5.1, 5, 4.3, 4.2, 4.1, 4, 3.2],
      popularity: [4.18754, 0.4515445, 0.4515445, 0.1317005, 0.1317005, 0.01075105, 0.01075105, 0.00537555, 0.00537555, 0]
    },
    opera: {
      prefix: "-o-",
      future: [21, 20],
      versions: [19, 18, 17, 16, 15, 12.1, 12, 11.6, 11.5, 11.1, 11, 10.6, 10.5, 10.1, 10, 9.6, 9.5],
      popularity: [0.038115, 0.358281, 0.030492, 0.022869, 0.015246, 0.419265, 0.038115, 0.030492, 0.015246, 0.008219, 0.008219, 0.007623, 0.008392, 0.007623, 0.007623, 0.0038115, 0.0038115]
    },
    safari: {
      prefix: "-webkit-",
      versions: [7, 6.1, 6, 5.1, 5, 4, 3.2, 3.1],
      popularity: [1.11296, 0.815661, 0.602217, 0.930006, 0.274428, 0.114345, 0.008692, 0]
    }
  };

}).call(this);

},{}],12:[function(require,module,exports){
(function() {
  var Browsers, utils;

  utils = require('./utils');

  Browsers = (function() {
    Browsers.prefixes = function() {
      var data, i, name;
      if (this.prefixesCache) {
        return this.prefixesCache;
      }
      data = require('../data/browsers');
      return this.prefixesCache = utils.uniq((function() {
        var _results;
        _results = [];
        for (name in data) {
          i = data[name];
          _results.push(i.prefix);
        }
        return _results;
      })()).sort(function(a, b) {
        return b.length - a.length;
      });
    };

    Browsers.withPrefix = function(value) {
      if (!this.prefixesRegexp) {
        this.prefixesRegexp = RegExp("" + (this.prefixes().join('|')));
      }
      return this.prefixesRegexp.test(value);
    };

    function Browsers(data, requirements) {
      this.data = data;
      this.selected = this.parse(requirements);
    }

    Browsers.prototype.parse = function(requirements) {
      var selected;
      if (!(requirements instanceof Array)) {
        requirements = [requirements];
      }
      selected = [];
      requirements.map((function(_this) {
        return function(req) {
          var i, match, name, _ref;
          _ref = _this.requirements;
          for (name in _ref) {
            i = _ref[name];
            if (match = req.match(i.regexp)) {
              selected = selected.concat(i.select.apply(_this, match.slice(1)));
              return;
            }
          }
          return utils.error("Unknown browser requirement `" + req + "`");
        };
      })(this));
      return utils.uniq(selected);
    };

    Browsers.prototype.aliases = {
      fx: 'ff',
      firefox: 'ff',
      explorer: 'ie',
      blackberry: 'bb'
    };

    Browsers.prototype.requirements = {
      none: {
        regexp: /^none$/i,
        select: function() {
          return [];
        }
      },
      lastVersions: {
        regexp: /^last (\d+) versions?$/i,
        select: function(versions) {
          return this.browsers(function(data) {
            if (data.minor) {
              return [];
            } else {
              return data.versions.slice(0, versions);
            }
          });
        }
      },
      lastByBrowser: {
        regexp: /^last (\d+) (\w+) versions?$/i,
        select: function(versions, browser) {
          var data;
          data = this.byName(browser);
          return data.versions.slice(0, versions).map(function(v) {
            return "" + data.name + " " + v;
          });
        }
      },
      globalStatistics: {
        regexp: /^> (\d+(\.\d+)?)%$/,
        select: function(popularity) {
          return this.browsers(function(data) {
            return data.versions.filter(function(version, i) {
              return data.popularity[i] > popularity;
            });
          });
        }
      },
      newerThen: {
        regexp: /^(\w+) (>=?)\s*([\d\.]+)/,
        select: function(browser, sign, version) {
          var data, filter;
          data = this.byName(browser);
          version = parseFloat(version);
          if (sign === '>') {
            filter = function(v) {
              return v > version;
            };
          } else if (sign === '>=') {
            filter = function(v) {
              return v >= version;
            };
          }
          return data.versions.filter(filter).map(function(v) {
            return "" + data.name + " " + v;
          });
        }
      },
      esr: {
        regexp: /^(firefox|ff|fx) esr$/i,
        select: function() {
          return ['ff 24'];
        }
      },
      direct: {
        regexp: /^(\w+) ([\d\.]+)$/,
        select: function(browser, version) {
          var data, first, last;
          data = this.byName(browser);
          version = parseFloat(version);
          last = data.future ? data.future[0] : data.versions[0];
          first = data.versions[data.versions.length - 1];
          if (version > last) {
            version = last;
          } else if (version < first) {
            version = first;
          }
          return ["" + data.name + " " + version];
        }
      }
    };

    Browsers.prototype.browsers = function(criteria) {
      var browser, data, selected, versions, _ref;
      selected = [];
      _ref = this.data;
      for (browser in _ref) {
        data = _ref[browser];
        versions = criteria(data).map(function(version) {
          return "" + browser + " " + version;
        });
        selected = selected.concat(versions);
      }
      return selected;
    };

    Browsers.prototype.prefix = function(browser) {
      var name, version, _ref;
      _ref = browser.split(' '), name = _ref[0], version = _ref[1];
      if (name === 'opera' && parseFloat(version) >= 15) {
        return '-webkit-';
      } else {
        return this.data[name].prefix;
      }
    };

    Browsers.prototype.isSelected = function(browser) {
      return this.selected.indexOf(browser) !== -1;
    };

    Browsers.prototype.byName = function(name) {
      var data;
      name = name.toLowerCase();
      name = this.aliases[name] || name;
      data = this.data[name];
      if (!data) {
        utils.error("Unknown browser " + browser);
      }
      data.name = name;
      return data;
    };

    return Browsers;

  })();

  module.exports = Browsers;

}).call(this);

},{"../data/browsers":11,"./utils":13}],13:[function(require,module,exports){
(function() {
  module.exports = {
    error: function(text) {
      var err;
      err = new Error(text);
      err.autoprefixer = true;
      throw err;
    },
    uniq: function(array) {
      var filtered, i, _i, _len;
      filtered = [];
      for (_i = 0, _len = array.length; _i < _len; _i++) {
        i = array[_i];
        if (filtered.indexOf(i) === -1) {
          filtered.push(i);
        }
      }
      return filtered;
    },
    removeNote: function(string) {
      if (string.indexOf(' ') === -1) {
        return string;
      } else {
        return string.split(' ')[0];
      }
    },
    escapeRegexp: function(string) {
      return string.replace(/[.?*+\^\$\[\]\\(){}|\-]/g, '\\$&');
    },
    regexp: function(word, escape) {
      if (escape == null) {
        escape = true;
      }
      if (escape) {
        word = this.escapeRegexp(word);
      }
      return RegExp("(^|[\\s,(])(" + word + "($|[\\s(,]))", "gi");
    }
  };

}).call(this);

},{}],14:[function(require,module,exports){

},{}],15:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};

process.nextTick = (function () {
    var canSetImmediate = typeof window !== 'undefined'
    && window.setImmediate;
    var canPost = typeof window !== 'undefined'
    && window.postMessage && window.addEventListener
    ;

    if (canSetImmediate) {
        return function (f) { return window.setImmediate(f) };
    }

    if (canPost) {
        var queue = [];
        window.addEventListener('message', function (ev) {
            var source = ev.source;
            if ((source === window || source === null) && ev.data === 'process-tick') {
                ev.stopPropagation();
                if (queue.length > 0) {
                    var fn = queue.shift();
                    fn();
                }
            }
        }, true);

        return function nextTick(fn) {
            queue.push(fn);
            window.postMessage('process-tick', '*');
        };
    }

    return function nextTick(fn) {
        setTimeout(fn, 0);
    };
})();

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];

process.binding = function (name) {
    throw new Error('process.binding is not supported');
}

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};

},{}],16:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require("/Volumes/DATA/Projects/autopolyfiller/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js"))
},{"/Volumes/DATA/Projects/autopolyfiller/node_modules/browserify/node_modules/insert-module-globals/node_modules/process/browser.js":15}],17:[function(require,module,exports){

/**
 * Expose `debug()` as the module.
 */

module.exports = debug;

/**
 * Create a debugger with the given `name`.
 *
 * @param {String} name
 * @return {Type}
 * @api public
 */

function debug(name) {
  if (!debug.enabled(name)) return function(){};

  return function(fmt){
    fmt = coerce(fmt);

    var curr = new Date;
    var ms = curr - (debug[name] || curr);
    debug[name] = curr;

    fmt = name
      + ' '
      + fmt
      + ' +' + debug.humanize(ms);

    // This hackery is required for IE8
    // where `console.log` doesn't have 'apply'
    window.console
      && console.log
      && Function.prototype.apply.call(console.log, console, arguments);
  }
}

/**
 * The currently active debug mode names.
 */

debug.names = [];
debug.skips = [];

/**
 * Enables a debug mode by name. This can include modes
 * separated by a colon and wildcards.
 *
 * @param {String} name
 * @api public
 */

debug.enable = function(name) {
  try {
    localStorage.debug = name;
  } catch(e){}

  var split = (name || '').split(/[\s,]+/)
    , len = split.length;

  for (var i = 0; i < len; i++) {
    name = split[i].replace('*', '.*?');
    if (name[0] === '-') {
      debug.skips.push(new RegExp('^' + name.substr(1) + '$'));
    }
    else {
      debug.names.push(new RegExp('^' + name + '$'));
    }
  }
};

/**
 * Disable debug output.
 *
 * @api public
 */

debug.disable = function(){
  debug.enable('');
};

/**
 * Humanize the given `ms`.
 *
 * @param {Number} m
 * @return {String}
 * @api private
 */

debug.humanize = function(ms) {
  var sec = 1000
    , min = 60 * 1000
    , hour = 60 * min;

  if (ms >= hour) return (ms / hour).toFixed(1) + 'h';
  if (ms >= min) return (ms / min).toFixed(1) + 'm';
  if (ms >= sec) return (ms / sec | 0) + 's';
  return ms + 'ms';
};

/**
 * Returns true if the given mode name is enabled, false otherwise.
 *
 * @param {String} name
 * @return {Boolean}
 * @api public
 */

debug.enabled = function(name) {
  for (var i = 0, len = debug.skips.length; i < len; i++) {
    if (debug.skips[i].test(name)) {
      return false;
    }
  }
  for (var i = 0, len = debug.names.length; i < len; i++) {
    if (debug.names[i].test(name)) {
      return true;
    }
  }
  return false;
};

/**
 * Coerce `val`.
 */

function coerce(val) {
  if (val instanceof Error) return val.stack || val.message;
  return val;
}

// persist

try {
  if (window.localStorage) debug.enable(localStorage.debug);
} catch(e){}

},{}],18:[function(require,module,exports){
// Generated by LiveScript 1.2.0
(function(){
  var attrMap, getNodeAtPath;
  attrMap = require('grasp-syntax-javascript').attrMap;
  getNodeAtPath = function(node, path){
    var i$, len$, prop, that;
    for (i$ = 0, len$ = path.length; i$ < len$; ++i$) {
      prop = path[i$];
      if ((that = node[attrMap[prop] || prop]) != null) {
        node = that;
      } else {
        return;
      }
    }
    return node;
  };
  module.exports = {
    getNodeAtPath: getNodeAtPath
  };
}).call(this);

},{"grasp-syntax-javascript":22}],19:[function(require,module,exports){
// Generated by LiveScript 1.2.0
(function(){
  var parse, matchNode, VERSION, query, queryParsed;
  parse = require('./parse').parse;
  matchNode = require('./match').matchNode;
  VERSION = '0.1.0';
  query = function(selector, ast){
    return queryParsed(parse(selector), ast);
  };
  queryParsed = function(parsedSelector, ast){
    var results;
    results = [];
    matchNode(results, parsedSelector, ast);
    return results;
  };
  module.exports = {
    parse: parse,
    queryParsed: queryParsed,
    query: query,
    VERSION: VERSION
  };
}).call(this);

},{"./match":20,"./parse":21}],20:[function(require,module,exports){
// Generated by LiveScript 1.2.0
(function(){
  var ref$, primitiveOnlyAttributes, eitherAttributes, all, tail, getNodeAtPath, toString$ = {}.toString, slice$ = [].slice;
  ref$ = require('grasp-syntax-javascript'), primitiveOnlyAttributes = ref$.primitiveOnlyAttributes, eitherAttributes = ref$.eitherAttributes;
  ref$ = require('prelude-ls'), all = ref$.all, tail = ref$.tail;
  getNodeAtPath = require('./common').getNodeAtPath;
  function matchNode(results, query, mainNode){
    var key, val, ref$;
    if (eq(mainNode, query)) {
      results.push(mainNode);
    }
    for (key in mainNode) {
      val = mainNode[key];
      if ((key !== 'loc' && key !== 'start' && key !== 'end' && key !== '_named') && ((ref$ = toString$.call(val).slice(8, -1)) === 'Object' || ref$ === 'Array')) {
        matchNode(results, query, val);
      }
    }
    function eq(targetNode, selectorNode){
      var selectorNodeType, prop;
      selectorNodeType = toString$.call(selectorNode).slice(8, -1);
      if (selectorNode === targetNode) {
        return true;
      } else if (selectorNodeType !== toString$.call(targetNode).slice(8, -1)) {
        return false;
      } else if (selectorNodeType === 'Object') {
        if (selectorNode.type === 'Grasp') {
          return matchSpecial(targetNode, selectorNode);
        } else {
          for (prop in targetNode) {
            if (prop !== 'loc' && prop !== 'start' && prop !== 'end' && prop !== '_named') {
              if (!eq(targetNode[prop], selectorNode[prop])) {
                return false;
              }
            }
          }
          return true;
        }
      } else if (selectorNodeType === 'Array') {
        return matchArray(selectorNode, targetNode);
      } else {
        return false;
      }
    }
    function matchArray(pattern, input){
      var patternLen, that, ref$, patternFirst, patternRest, inputFirst, inputRest, arrayWildcardName, wildcardName;
      patternLen = pattern.length;
      if (patternLen === 0) {
        return input.length === 0;
      } else if (patternLen === 1) {
        if (that = isArrayWildcard(pattern[0])) {
          if (that = that.name) {
            mainNode._named == null && (mainNode._named = {});
            (ref$ = mainNode._named)[that] == null && (ref$[that] = []);
            (ref$ = mainNode._named)[that] = ref$[that].concat(input);
          }
          return true;
        } else {
          return input.length === 1 && eq(input[0], pattern[0]);
        }
      } else if (input.length === 0) {
        return false;
      } else {
        patternFirst = pattern[0], patternRest = slice$.call(pattern, 1);
        inputFirst = input[0], inputRest = slice$.call(input, 1);
        if (that = isArrayWildcard(patternFirst)) {
          if (that = that.name) {
            arrayWildcardName = that;
            mainNode._named == null && (mainNode._named = {});
            (ref$ = mainNode._named)[arrayWildcardName] == null && (ref$[arrayWildcardName] = []);
          }
          if (that = eq(inputFirst, patternRest[0])) {
            wildcardName = that;
            if (matchArray(tail(patternRest), inputRest)) {
              return true;
            } else {
              if (toString$.call(wildcardName).slice(8, -1) === 'String') {
                delete mainNode._named[wildcardName];
              }
              return matchArray(pattern, inputRest);
            }
          } else {
            if (arrayWildcardName) {
              mainNode._named[arrayWildcardName].push(inputFirst);
            }
            return matchArray(pattern, inputRest);
          }
        } else {
          return eq(inputFirst, patternFirst) && matchArray(patternRest, inputRest);
        }
      }
    }
    function matchSpecial(targetNode, selectorNode){
      var named, name, that, identMatch, attrMatch;
      switch (selectorNode.graspType) {
      case 'wildcard':
        return true;
      case 'named-wildcard':
        mainNode._named == null && (mainNode._named = {});
        named = mainNode._named;
        name = selectorNode.name;
        if (that = named[name]) {
          if (eq(targetNode, that)) {
            return true;
          } else {
            return false;
          }
        } else {
          named[name] = targetNode;
          return name;
        }
        break;
      case 'node-type':
        return targetNode.type === selectorNode.value;
      case 'matches':
        return in$(targetNode.type, selectorNode.value);
      case 'literal':
        return targetNode.type === 'Literal' && toString$.call(targetNode.value).slice(8, -1) === selectorNode.value;
      case 'compound':
        identMatch = matchSpecial(targetNode, selectorNode.ident);
        attrMatch = all(matchAttr(targetNode), selectorNode.attrs);
        return identMatch && attrMatch;
      }
    }
    function isArrayWildcard(node){
      var cleanNode;
      cleanNode = node.type === 'ExpressionStatement' ? node.expression : node;
      return cleanNode.type === 'Grasp' && cleanNode.graspType === 'array-wildcard' && cleanNode;
    }
    function matchAttr(targetNode){
      return function(attr){
        var node, attrValue, lastPath, ref$;
        node = getNodeAtPath(targetNode, attr.path);
        if (node != null) {
          attrValue = attr.value;
          if (attrValue) {
            lastPath = (ref$ = attr.path)[ref$.length - 1];
            if (in$(lastPath, primitiveOnlyAttributes)) {
              return matchPrimitive(attr.op, node, attrValue);
            } else if (in$(lastPath, eitherAttributes)) {
              return matchEither(attr.op, node, attrValue);
            } else {
              return matchComplex(attr.op, node, attrValue);
            }
          } else {
            return true;
          }
        } else {
          return false;
        }
      };
    }
    function matchPrimitive(op, node, attrValue){
      if (op === '=') {
        return node === attrValue.value;
      } else {
        return node !== attrValue.value;
      }
    }
    function matchComplex(op, node, attrValue){
      if (op === '=') {
        return eq(node, attrValue);
      } else {
        return !eq(node, attrValue);
      }
    }
    function matchEither(op, node, attrValue){
      return matchPrimitive(op, node, attrValue) || matchComplex(op, node, attrValue);
    }
  }
  module.exports = {
    matchNode: matchNode
  };
  function in$(x, xs){
    var i = -1, l = xs.length >>> 0;
    while (++i < l) if (x === xs[i]) return true;
    return false;
  }
}).call(this);

},{"./common":18,"grasp-syntax-javascript":22,"prelude-ls":28}],21:[function(require,module,exports){
// Generated by LiveScript 1.2.0
(function(){
  var acorn, ref$, aliasMap, matchesMap, matchesAliasMap, literalMap, getNodeAtPath, toString$ = {}.toString;
  acorn = require('acorn');
  ref$ = require('grasp-syntax-javascript'), aliasMap = ref$.aliasMap, matchesMap = ref$.matchesMap, matchesAliasMap = ref$.matchesAliasMap, literalMap = ref$.literalMap;
  getNodeAtPath = require('./common').getNodeAtPath;
  function parse(selector){
    var attempts, i$, len$, attempt, code, parsedSelector, path, e, selectorBody, extractedSelector, finalSelector, root;
    attempts = [
      {
        code: selector,
        path: []
      }, {
        code: "function f(){ " + selector + "; }",
        path: ['body', 'body', 0]
      }, {
        code: "(" + selector + ")",
        path: []
      }, {
        code: "while (true) { " + selector + "; }",
        path: ['body', 'body', 0]
      }, {
        code: "switch (x) { " + selector + " }",
        path: ['cases', 0]
      }, {
        code: "try { } " + selector,
        path: ['handlers', 0]
      }
    ];
    for (i$ = 0, len$ = attempts.length; i$ < len$; ++i$) {
      attempt = attempts[i$], code = attempt.code;
      try {
        parsedSelector = acorn.parse(code);
        path = attempt.path;
        break;
      } catch (e$) {
        e = e$;
        continue;
      }
    }
    if (!parsedSelector) {
      throw new Error("Error processing selector '" + selector + "'.");
    }
    selectorBody = parsedSelector.body;
    if (selectorBody.length > 1) {
      throw new Error("Selector body can't be more than one statement");
    }
    extractedSelector = getNodeAtPath(selectorBody[0], path);
    finalSelector = extractedSelector.type === 'ExpressionStatement' && !/;\s*$/.test(selector) ? extractedSelector.expression : extractedSelector;
    root = {
      type: 'Root',
      value: finalSelector
    };
    processSelector(root);
    return root.value;
  }
  function processSelector(ast){
    var key, node, nodeType, i$, len$, i, n, that;
    delete ast.start;
    delete ast.end;
    for (key in ast) {
      node = ast[key];
      if (key !== 'type') {
        nodeType = toString$.call(node).slice(8, -1);
        if (nodeType === 'Array') {
          for (i$ = 0, len$ = node.length; i$ < len$; ++i$) {
            i = i$;
            n = node[i$];
            if (that = processNode(n)) {
              node[i] = that;
            } else {
              processSelector(n);
            }
          }
        } else if (nodeType === 'Object') {
          if (that = processNode(node)) {
            ast[key] = that;
          } else {
            processSelector(node);
          }
        }
      }
    }
  }
  function processNode(node){
    var name, that, ident, attrs, n, processedAttrs, i$, len$, attr, nodeKey, nodeValue;
    switch (node.type) {
    case 'Identifier':
      name = node.name;
      if (name === '_') {
        return null;
      } else if (name === '__') {
        return {
          type: 'Grasp',
          graspType: 'wildcard'
        };
      } else if (that = /^_\$(\w*)$/.exec(name)) {
        return {
          type: 'Grasp',
          graspType: 'array-wildcard',
          name: that[1]
        };
      } else if (that = /^\$(\w+)$/.exec(name)) {
        return {
          type: 'Grasp',
          graspType: 'named-wildcard',
          name: that[1]
        };
      } else if (that = /^_([_a-zA-Z]+)/.exec(name)) {
        ident = that[1].replace(/_/, '-');
        if (ident in matchesMap || ident in matchesAliasMap) {
          return {
            type: 'Grasp',
            graspType: 'matches',
            value: matchesMap[matchesAliasMap[ident] || ident]
          };
        } else if (ident in literalMap) {
          return {
            type: 'Grasp',
            graspType: 'literal',
            value: literalMap[ident]
          };
        } else {
          return {
            type: 'Grasp',
            graspType: 'node-type',
            value: aliasMap[ident] || ident
          };
        }
      }
      break;
    case 'MemberExpression':
      if (!node.computed) {
        return;
      }
      attrs = [];
      n = node;
      while (n.type === 'MemberExpression') {
        if (!n.computed) {
          return;
        }
        attrs.unshift(n.property);
        n = n.object;
      }
      if (n.type !== 'Identifier') {
        return;
      }
      ident = processNode(n);
      if (!ident) {
        return;
      }
      processedAttrs = [];
      for (i$ = 0, len$ = attrs.length; i$ < len$; ++i$) {
        attr = attrs[i$];
        if (that = processAttr(attr)) {
          processedAttrs.push(that);
        } else {
          return;
        }
      }
      return {
        type: 'Grasp',
        graspType: 'compound',
        ident: ident,
        attrs: processedAttrs
      };
    case 'ExpressionStatement':
      return processNode(node.expression);
    default:
      if (!(!node.type && node.key != null && node.value != null)) {
        return;
      }
      nodeKey = node.key, nodeValue = node.value;
      if (!(nodeKey.type === 'Identifier' && nodeValue.type === 'Identifier')) {
        return;
      }
      if (nodeKey.name === '_') {
        if (node.value.name === '_') {
          return {
            type: 'Grasp',
            graspType: 'wildcard'
          };
        } else if (/^\$/.test(nodeValue.name)) {
          return {
            type: 'Grasp',
            graspType: 'array-wildcard',
            name: /^\$(\w*)$/.exec(nodeValue.name)[1]
          };
        }
      } else if (nodeKey.name === '$') {
        return {
          type: 'Grasp',
          graspType: 'named-wildcard',
          name: nodeValue.name
        };
      }
    }
  }
  function processAttr(attr){
    var attrType, path, ref$;
    attrType = attr.type;
    if (attrType === 'Identifier') {
      return {
        path: [attr.name]
      };
    } else if (attrType === 'MemberExpression') {
      path = getMemberPath(attr);
      if (!path) {
        return;
      }
      return {
        path: path
      };
    } else if ((attrType === 'AssignmentExpression' || attrType === 'BinaryExpression') && ((ref$ = attr.operator) === '=' || ref$ === '!=')) {
      path = getMemberPath(attr.left);
      if (!path) {
        return;
      }
      return {
        path: path,
        op: attr.operator,
        value: attr.right
      };
    }
  }
  function getMemberPath(node){
    var path;
    path = [];
    while (node.type === 'MemberExpression') {
      if (node.computed) {
        return;
      }
      path.unshift(node.property.name);
      node = node.object;
    }
    path.unshift(node.name);
    return path;
  }
  module.exports = {
    parse: parse
  };
}).call(this);

},{"./common":18,"acorn":10,"grasp-syntax-javascript":22}],22:[function(require,module,exports){
// Generated by LiveScript 1.2.0
(function(){
  var ref$, each, keys, difference, intersection, syntax, syntaxFlat, i$, category, nodeName, node, complexTypes, complexTypeMap, key, val, aliasMap, matchesMap, matchesAliasMap, literals, literalMap, attrMap, attrMapInverse, alias, name, primitiveAttributesSet, nonPrimitiveAttributesSet, that, nonPrimitiveAttributes, primitiveAttributes, eitherAttributes, primitiveOnlyAttributes;
  ref$ = require('prelude-ls'), each = ref$.each, keys = ref$.keys, difference = ref$.difference, intersection = ref$.intersection;
  syntax = {
    Misc: {
      Program: {
        alias: 'program',
        nodeArrays: ['body'],
        note: "The root node of a JavaScript program's AST."
      },
      Identifier: {
        alias: 'ident',
        primitives: ['name'],
        example: 'x'
      },
      Literal: {
        alias: 'literal',
        primitives: ['value'],
        example: ['true', '1', '"string"']
      },
      Property: {
        alias: 'prop',
        nodes: ['key', 'value'],
        primitives: ['kind'],
        syntax: '*key*: *value*',
        example: 'a: 1',
        note: 'An object expression (obj) has a list of properties, each being a property.'
      }
    },
    Statements: {
      EmptyStatement: {
        alias: 'empty',
        example: ';'
      },
      BlockStatement: {
        alias: 'block',
        nodeArrays: ['body'],
        syntax: '{\n  *statement_1*\n  *statement_2*\n  *...*\n  *statement_n*\n}',
        example: '{\n  x = 1;\n  f();\n  x++;\n}'
      },
      ExpressionStatement: {
        alias: 'exp-statement',
        nodes: ['expression'],
        syntax: '*expression*;',
        example: '2;',
        note: 'When an expression is used where a statement should be, it is wrapped in an expression statement.'
      },
      IfStatement: {
        alias: 'if',
        nodes: ['test', 'consequent', 'alternate'],
        syntax: 'if (*test*)\n  *consequent*\n[else\n  *alternate*]',
        example: ['if (even(x)) {\n  f(x);\n}', 'if (x === 2) {\n  x++;\n} else {\n  f(x);\n}']
      },
      LabeledStatement: {
        alias: 'label',
        nodes: ['label', 'body'],
        syntax: '*label*: *body*;',
        example: 'outer:\nfor (i = 0; i < xs.length; i++) {\n  for (j = 0; j < ys.length; j++) {\n    if (xs[i] === ys[j]) {\n      break outer;\n    }\n  }\n}'
      },
      BreakStatement: {
        alias: 'break',
        nodes: ['label'],
        syntax: 'break [*label*];',
        example: ['break;', 'break outer;']
      },
      ContinueStatement: {
        alias: 'continue',
        nodes: ['label'],
        syntax: 'continue [*label*];',
        example: ['continue;', 'continue outerLoop;']
      },
      WithStatement: {
        alias: 'with',
        nodes: ['object', 'body'],
        syntax: 'with (*object*)\n  *body*',
        example: 'with ({x: 42}) {\n  f(x);\n}'
      },
      SwitchStatement: {
        alias: 'switch',
        nodes: ['discriminant'],
        nodeArrays: ['cases'],
        syntax: 'switch (*discriminant*) {\n  *case_1*\n  *case_2*\n  *...*\n  *case_n*\n}',
        example: 'switch (num) {\n  case 1:\n    f(\'one\');\n    break;\n  case 2:\n    f(\'two\');\n    break;\n  default:\n    f(\'too many\');\n}'
      },
      ReturnStatement: {
        alias: 'return',
        nodes: ['argument'],
        syntax: 'return *argument*;',
        example: 'return f(2);'
      },
      ThrowStatement: {
        alias: 'throw',
        nodes: ['argument'],
        syntax: 'throw *argument*;',
        example: 'throw new Error("oops");'
      },
      TryStatement: {
        alias: 'try',
        nodes: ['block', 'handler', 'finalizer'],
        syntax: 'try\n  *block*\n[*handler*]\n[finally\n   *finalizer*]',
        example: 'try {\n  result = parse(input);\n} catch (error) {\n  console.error(error.message);\n  result = \'\';\n} finally {\n  g(result);\n}'
      },
      WhileStatement: {
        alias: 'while',
        nodes: ['test', 'body'],
        syntax: 'while (*test*)\n  *body*',
        example: 'while (x < 2) {\n  f(x);\n  x++;\n}'
      },
      DoWhileStatement: {
        alias: 'do-while',
        nodes: ['test', 'body'],
        syntax: 'do\n  *body*\nwhile (*test*);',
        example: 'do {\n  f(x);\n  x++;\n} while (x < 2);'
      },
      ForStatement: {
        alias: 'for',
        nodes: ['init', 'test', 'update', 'body'],
        syntax: 'for ([*init*]; [*test*]; [*update*])\n  *body*',
        example: 'for (var x = 0; x < 2; x++) {\n  f(x);\n}'
      },
      ForInStatement: {
        alias: 'for-in',
        nodes: ['left', 'right', 'body'],
        syntax: 'for (*left* in *right*)\n  *body*',
        example: 'for (prop in object) {\n  f(object[prop]);\n}'
      },
      DebuggerStatement: {
        alias: 'debugger',
        syntax: 'debugger;',
        example: 'debugger;'
      }
    },
    Declarations: {
      FunctionDeclaration: {
        alias: 'func-dec',
        nodes: ['id', 'body'],
        nodeArrays: ['params'],
        syntax: 'function *id*([*param_1*], [*param_2*], [..., *param_3*])\n  *body*',
        example: 'function f(x, y) {\n  return x * y;\n}',
        note: 'A function declaration contrasts with a function expression (func-exp).'
      },
      VariableDeclaration: {
        alias: 'var-decs',
        nodeArrays: ['declarations'],
        primitives: ['kind'],
        syntax: 'var *declaration_1*[, *declaration_2*, ..., *declaration_n*]',
        example: 'var x = 1, y = 2;',
        note: 'Each declaration is a variable declarator (var-dec).'
      },
      VariableDeclarator: {
        alias: 'var-dec',
        nodes: ['id', 'init'],
        syntax: '*id* = *init*',
        example: 'var x = 2'
      }
    },
    Expressions: {
      ThisExpression: {
        alias: 'this',
        example: 'this'
      },
      ArrayExpression: {
        alias: 'arr',
        nodeArrays: ['elements'],
        syntax: '[*element_0*, *element_1*, *...*, *element_n*]',
        example: ['[1, 2, 3]', '[]']
      },
      ObjectExpression: {
        alias: 'obj',
        nodeArrays: ['properties'],
        syntax: '{\n  *property_1*,\n  *property_2*,\n  *...*,\n  *property_n*\n}',
        example: ['{a: 1, b: 2}', '{}']
      },
      FunctionExpression: {
        alias: 'func-exp',
        nodes: ['id', 'body'],
        nodeArrays: ['params'],
        syntax: 'function [*id*]([*param_1*], [*param_2*], [..., *param_3*])\n  *body*',
        example: 'var f = function (x, y) {\n  return x * y;\n}',
        note: 'A function expression contrasts with a function declaration (func-dec).'
      },
      SequenceExpression: {
        alias: 'seq',
        nodeArrays: ['expressions'],
        syntax: '*expression_1*, *expression_2*, *...*, *expression_n*',
        example: 'a, b, c'
      },
      UnaryExpression: {
        alias: 'unary',
        nodes: ['argument'],
        primitive: ['operator', 'prefix'],
        syntax: '*operator**argument*',
        example: ['+x', 'typeof x']
      },
      BinaryExpression: {
        alias: 'bi',
        nodes: ['left', 'right'],
        primitives: ['operator'],
        syntax: '*left* *operator* *right*',
        example: 'x === z'
      },
      AssignmentExpression: {
        alias: 'assign',
        nodes: ['left', 'right'],
        primitives: ['operator'],
        syntax: '*left* *operator* *right*',
        example: '(y = 2)'
      },
      UpdateExpression: {
        alias: 'update',
        nodes: ['argument'],
        primitives: ['operator', 'prefix'],
        syntax: '*argument**operator*\n\n*or, if prefix*\n\n*operator**argument*',
        example: ['++x', 'x--']
      },
      LogicalExpression: {
        alias: 'logic',
        nodes: ['left', 'right'],
        primitives: ['operator'],
        syntax: '*left* *operator* *right*',
        example: 'x && y'
      },
      ConditionalExpression: {
        alias: 'cond',
        nodes: ['test', 'consequent', 'alternate'],
        syntax: '*test* ? *consequent* : *alternate*',
        example: 'x % 2 ? "odd" : "even"'
      },
      NewExpression: {
        alias: 'new',
        nodes: ['callee'],
        nodeArrays: ['arguments'],
        syntax: 'new *callee*(*argument_1*, *argument_2*, *...*, *argument_n*)',
        example: 'new Date(2011, 11, 11)'
      },
      CallExpression: {
        alias: 'call',
        nodes: ['callee'],
        nodeArrays: ['arguments'],
        syntax: '*callee*(*argument_1*, *argument_2*, *...*, *argument_n*)',
        example: 'f(1,2,3)'
      },
      MemberExpression: {
        alias: 'member',
        nodes: ['object', 'property'],
        primitives: ['computed'],
        syntax: '*object*.*property*',
        example: 'Math.PI'
      }
    },
    Clauses: {
      SwitchCase: {
        alias: 'switch-case',
        nodes: ['test'],
        nodeArrays: ['consequent'],
        syntax: 'case *test* | default :\n  *consequent*',
        example: ['case 1:\n  z = \'one\';\n  break;', 'default:\n  z = \'two\'']
      },
      CatchClause: {
        alias: 'catch',
        nodes: ['param', 'body'],
        syntax: 'catch (*param*)\n  *body*',
        example: 'catch (e) {\n  console.error(e.message);\n}'
      }
    }
  };
  syntaxFlat = {};
  for (i$ in syntax) {
    category = syntax[i$];
    for (nodeName in category) {
      node = category[nodeName];
      syntaxFlat[nodeName] = node;
    }
  }
  complexTypes = {
    iife: 'ImmediatelyInvokedFunctionExpression'
  };
  complexTypeMap = {};
  for (key in complexTypes) {
    val = complexTypes[key];
    complexTypeMap[key] = val;
    complexTypeMap[val] = val;
  }
  aliasMap = {};
  for (nodeName in syntaxFlat) {
    node = syntaxFlat[nodeName];
    aliasMap[node.alias] = nodeName;
  }
  matchesMap = {
    Statement: keys(syntax.Statements),
    Declaration: keys(syntax.Declarations),
    Expression: keys(syntax.Expressions),
    Clause: keys(syntax.Clauses),
    BiOp: ['BinaryExpression', 'LogicalExpression', 'AssignmentExpression'],
    Function: ['FunctionDeclaration', 'FunctionExpression'],
    ForLoop: ['ForStatement', 'ForInStatement'],
    WhileLoop: ['DoWhileStatement', 'WhileStatement'],
    Loop: ['ForStatement', 'ForInStatement', 'DoWhileStatement', 'WhileStatement']
  };
  matchesAliasMap = {
    statement: 'Statement',
    dec: 'Declaration',
    exp: 'Expression',
    clause: 'Clause',
    biop: 'BiOp',
    func: 'Function',
    'for-loop': 'ForLoop',
    'while-loop': 'WhileLoop',
    loop: 'Loop'
  };
  literals = {
    'null': 'Null',
    bool: 'Boolean',
    num: 'Number',
    str: 'String',
    regex: 'RegExp'
  };
  literalMap = {};
  for (key in literals) {
    val = literals[key];
    literalMap[key] = val;
    literalMap[val] = val;
  }
  attrMap = {
    exp: 'expression',
    exps: 'expressions',
    then: 'consequent',
    alt: 'alternate',
    'else': 'alternate',
    op: 'operator',
    l: 'left',
    r: 'right',
    arg: 'argument',
    args: 'arguments',
    els: 'elements',
    val: 'value',
    obj: 'object',
    prop: 'property',
    props: 'properties',
    decs: 'declarations'
  };
  attrMapInverse = {};
  for (alias in attrMap) {
    name = attrMap[alias];
    attrMapInverse[name] == null && (attrMapInverse[name] = []);
    attrMapInverse[name].push(alias);
  }
  primitiveAttributesSet = {};
  nonPrimitiveAttributesSet = {};
  for (nodeName in syntaxFlat) {
    node = syntaxFlat[nodeName];
    if (that = node.primitives) {
      each(fn$, that);
    }
    if (that = node.nodes) {
      each(fn1$, that);
    }
    if (that = node.nodeArrays) {
      each(fn2$, that);
    }
  }
  nonPrimitiveAttributes = keys(nonPrimitiveAttributesSet);
  primitiveAttributes = keys(primitiveAttributesSet);
  eitherAttributes = intersection(primitiveAttributes, nonPrimitiveAttributes);
  primitiveOnlyAttributes = difference(primitiveAttributes, nonPrimitiveAttributes);
  module.exports = {
    syntax: syntax,
    syntaxFlat: syntaxFlat,
    complexTypeMap: complexTypeMap,
    aliasMap: aliasMap,
    matchesMap: matchesMap,
    matchesAliasMap: matchesAliasMap,
    literalMap: literalMap,
    attrMap: attrMap,
    attrMapInverse: attrMapInverse,
    primitiveOnlyAttributes: primitiveOnlyAttributes,
    eitherAttributes: eitherAttributes
  };
  function fn$(it){
    return primitiveAttributesSet[it] = true;
  }
  function fn1$(it){
    return nonPrimitiveAttributesSet[it] = true;
  }
  function fn2$(it){
    return nonPrimitiveAttributesSet[it] = true;
  }
}).call(this);

},{"prelude-ls":28}],23:[function(require,module,exports){
var curry, flip, fix, apply;
curry = function(f){
  return curry$(f);
};
flip = curry$(function(f, x, y){
  return f(y, x);
});
fix = function(f){
  return function(g, x){
    return function(){
      return f(g(g)).apply(null, arguments);
    };
  }(function(g, x){
    return function(){
      return f(g(g)).apply(null, arguments);
    };
  });
};
apply = curry$(function(f, list){
  return f.apply(null, list);
});
module.exports = {
  curry: curry,
  flip: flip,
  fix: fix,
  apply: apply
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

},{}],24:[function(require,module,exports){
var each, map, compact, filter, reject, partition, find, head, first, tail, last, initial, empty, reverse, unique, fold, foldl, fold1, foldl1, foldr, foldr1, unfoldr, concat, concatMap, flatten, difference, intersection, union, countBy, groupBy, andList, orList, any, all, sort, sortWith, sortBy, sum, product, mean, average, maximum, minimum, scan, scanl, scan1, scanl1, scanr, scanr1, slice, take, drop, splitAt, takeWhile, dropWhile, span, breakList, zip, zipWith, zipAll, zipAllWith, toString$ = {}.toString, slice$ = [].slice;
each = curry$(function(f, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    f(x);
  }
  return xs;
});
map = curry$(function(f, xs){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    results$.push(f(x));
  }
  return results$;
});
compact = curry$(function(xs){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (x) {
      results$.push(x);
    }
  }
  return results$;
});
filter = curry$(function(f, xs){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (f(x)) {
      results$.push(x);
    }
  }
  return results$;
});
reject = curry$(function(f, xs){
  var i$, len$, x, results$ = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!f(x)) {
      results$.push(x);
    }
  }
  return results$;
});
partition = curry$(function(f, xs){
  var passed, failed, i$, len$, x;
  passed = [];
  failed = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    (f(x) ? passed : failed).push(x);
  }
  return [passed, failed];
});
find = curry$(function(f, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (f(x)) {
      return x;
    }
  }
});
head = first = function(xs){
  if (!xs.length) {
    return;
  }
  return xs[0];
};
tail = function(xs){
  if (!xs.length) {
    return;
  }
  return xs.slice(1);
};
last = function(xs){
  if (!xs.length) {
    return;
  }
  return xs[xs.length - 1];
};
initial = function(xs){
  var len;
  len = xs.length;
  if (!len) {
    return;
  }
  return xs.slice(0, len - 1);
};
empty = function(xs){
  return !xs.length;
};
reverse = function(xs){
  return xs.concat().reverse();
};
unique = function(xs){
  var result, i$, len$, x;
  result = [];
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!in$(x, result)) {
      result.push(x);
    }
  }
  return result;
};
fold = foldl = curry$(function(f, memo, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    memo = f(memo, x);
  }
  return memo;
});
fold1 = foldl1 = curry$(function(f, xs){
  return fold(f, xs[0], xs.slice(1));
});
foldr = curry$(function(f, memo, xs){
  return fold(f, memo, xs.concat().reverse());
});
foldr1 = curry$(function(f, xs){
  var ys;
  ys = xs.concat().reverse();
  return fold(f, ys[0], ys.slice(1));
});
unfoldr = curry$(function(f, b){
  var result, x, that;
  result = [];
  x = b;
  while ((that = f(x)) != null) {
    result.push(that[0]);
    x = that[1];
  }
  return result;
});
concat = function(xss){
  return [].concat.apply([], xss);
};
concatMap = curry$(function(f, xs){
  var x;
  return [].concat.apply([], (function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = xs).length; i$ < len$; ++i$) {
      x = ref$[i$];
      results$.push(f(x));
    }
    return results$;
  }()));
});
flatten = curry$(function(xs){
  var x;
  return [].concat.apply([], (function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = xs).length; i$ < len$; ++i$) {
      x = ref$[i$];
      if (toString$.call(x).slice(8, -1) === 'Array') {
        results$.push(flatten(x));
      } else {
        results$.push(x);
      }
    }
    return results$;
  }()));
});
difference = function(xs){
  var yss, results, i$, len$, x, j$, len1$, ys;
  yss = slice$.call(arguments, 1);
  results = [];
  outer: for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    for (j$ = 0, len1$ = yss.length; j$ < len1$; ++j$) {
      ys = yss[j$];
      if (in$(x, ys)) {
        continue outer;
      }
    }
    results.push(x);
  }
  return results;
};
intersection = function(xs){
  var yss, results, i$, len$, x, j$, len1$, ys;
  yss = slice$.call(arguments, 1);
  results = [];
  outer: for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    for (j$ = 0, len1$ = yss.length; j$ < len1$; ++j$) {
      ys = yss[j$];
      if (!in$(x, ys)) {
        continue outer;
      }
    }
    results.push(x);
  }
  return results;
};
union = function(){
  var xss, results, i$, len$, xs, j$, len1$, x;
  xss = slice$.call(arguments);
  results = [];
  for (i$ = 0, len$ = xss.length; i$ < len$; ++i$) {
    xs = xss[i$];
    for (j$ = 0, len1$ = xs.length; j$ < len1$; ++j$) {
      x = xs[j$];
      if (!in$(x, results)) {
        results.push(x);
      }
    }
  }
  return results;
};
countBy = curry$(function(f, xs){
  var results, i$, len$, x, key;
  results = {};
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    key = f(x);
    if (key in results) {
      results[key] += 1;
    } else {
      results[key] = 1;
    }
  }
  return results;
});
groupBy = curry$(function(f, xs){
  var results, i$, len$, x, key;
  results = {};
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    key = f(x);
    if (key in results) {
      results[key].push(x);
    } else {
      results[key] = [x];
    }
  }
  return results;
});
andList = function(xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!x) {
      return false;
    }
  }
  return true;
};
orList = function(xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (x) {
      return true;
    }
  }
  return false;
};
any = curry$(function(f, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (f(x)) {
      return true;
    }
  }
  return false;
});
all = curry$(function(f, xs){
  var i$, len$, x;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    if (!f(x)) {
      return false;
    }
  }
  return true;
});
sort = function(xs){
  return xs.concat().sort(function(x, y){
    if (x > y) {
      return 1;
    } else if (x < y) {
      return -1;
    } else {
      return 0;
    }
  });
};
sortWith = curry$(function(f, xs){
  if (!xs.length) {
    return [];
  }
  return xs.concat().sort(f);
});
sortBy = curry$(function(f, xs){
  if (!xs.length) {
    return [];
  }
  return xs.concat().sort(function(x, y){
    if (f(x) > f(y)) {
      return 1;
    } else if (f(x) < f(y)) {
      return -1;
    } else {
      return 0;
    }
  });
});
sum = function(xs){
  var result, i$, len$, x;
  result = 0;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    result += x;
  }
  return result;
};
product = function(xs){
  var result, i$, len$, x;
  result = 1;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    x = xs[i$];
    result *= x;
  }
  return result;
};
mean = average = function(xs){
  var sum, len, i$, i;
  sum = 0;
  len = xs.length;
  for (i$ = 0; i$ < len; ++i$) {
    i = i$;
    sum += xs[i];
  }
  return sum / len;
};
maximum = function(xs){
  var max, i$, ref$, len$, x;
  max = xs[0];
  for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
    x = ref$[i$];
    if (x > max) {
      max = x;
    }
  }
  return max;
};
minimum = function(xs){
  var min, i$, ref$, len$, x;
  min = xs[0];
  for (i$ = 0, len$ = (ref$ = xs.slice(1)).length; i$ < len$; ++i$) {
    x = ref$[i$];
    if (x < min) {
      min = x;
    }
  }
  return min;
};
scan = scanl = curry$(function(f, memo, xs){
  var last, x;
  last = memo;
  return [memo].concat((function(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = xs).length; i$ < len$; ++i$) {
      x = ref$[i$];
      results$.push(last = f(last, x));
    }
    return results$;
  }()));
});
scan1 = scanl1 = curry$(function(f, xs){
  if (!xs.length) {
    return;
  }
  return scan(f, xs[0], xs.slice(1));
});
scanr = curry$(function(f, memo, xs){
  xs = xs.concat().reverse();
  return scan(f, memo, xs).reverse();
});
scanr1 = curry$(function(f, xs){
  if (!xs.length) {
    return;
  }
  xs = xs.concat().reverse();
  return scan(f, xs[0], xs.slice(1)).reverse();
});
slice = curry$(function(x, y, xs){
  return xs.slice(x, y);
});
take = curry$(function(n, xs){
  if (n <= 0) {
    return xs.slice(0, 0);
  } else if (!xs.length) {
    return xs;
  } else {
    return xs.slice(0, n);
  }
});
drop = curry$(function(n, xs){
  if (n <= 0 || !xs.length) {
    return xs;
  } else {
    return xs.slice(n);
  }
});
splitAt = curry$(function(n, xs){
  return [take(n, xs), drop(n, xs)];
});
takeWhile = curry$(function(p, xs){
  var len, i;
  len = xs.length;
  if (!len) {
    return xs;
  }
  i = 0;
  while (i < len && p(xs[i])) {
    i += 1;
  }
  return xs.slice(0, i);
});
dropWhile = curry$(function(p, xs){
  var len, i;
  len = xs.length;
  if (!len) {
    return xs;
  }
  i = 0;
  while (i < len && p(xs[i])) {
    i += 1;
  }
  return xs.slice(i);
});
span = curry$(function(p, xs){
  return [takeWhile(p, xs), dropWhile(p, xs)];
});
breakList = curry$(function(p, xs){
  return span(compose$([not$, p]), xs);
});
zip = curry$(function(xs, ys){
  var result, len, i$, len$, i, x;
  result = [];
  len = ys.length;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (i === len) {
      break;
    }
    result.push([x, ys[i]]);
  }
  return result;
});
zipWith = curry$(function(f, xs, ys){
  var result, len, i$, len$, i, x;
  result = [];
  len = ys.length;
  for (i$ = 0, len$ = xs.length; i$ < len$; ++i$) {
    i = i$;
    x = xs[i$];
    if (i === len) {
      break;
    }
    result.push(f(x, ys[i]));
  }
  return result;
});
zipAll = function(){
  var xss, minLength, i$, len$, xs, ref$, i, lresult$, j$, results$ = [];
  xss = slice$.call(arguments);
  minLength = 9e9;
  for (i$ = 0, len$ = xss.length; i$ < len$; ++i$) {
    xs = xss[i$];
    minLength <= (ref$ = xs.length) || (minLength = ref$);
  }
  for (i$ = 0; i$ < minLength; ++i$) {
    i = i$;
    lresult$ = [];
    for (j$ = 0, len$ = xss.length; j$ < len$; ++j$) {
      xs = xss[j$];
      lresult$.push(xs[i]);
    }
    results$.push(lresult$);
  }
  return results$;
};
zipAllWith = function(f){
  var xss, minLength, i$, len$, xs, ref$, i, results$ = [];
  xss = slice$.call(arguments, 1);
  minLength = 9e9;
  for (i$ = 0, len$ = xss.length; i$ < len$; ++i$) {
    xs = xss[i$];
    minLength <= (ref$ = xs.length) || (minLength = ref$);
  }
  for (i$ = 0; i$ < minLength; ++i$) {
    i = i$;
    results$.push(f.apply(null, (fn$())));
  }
  return results$;
  function fn$(){
    var i$, ref$, len$, results$ = [];
    for (i$ = 0, len$ = (ref$ = xss).length; i$ < len$; ++i$) {
      xs = ref$[i$];
      results$.push(xs[i]);
    }
    return results$;
  }
};
module.exports = {
  each: each,
  map: map,
  filter: filter,
  compact: compact,
  reject: reject,
  partition: partition,
  find: find,
  head: head,
  first: first,
  tail: tail,
  last: last,
  initial: initial,
  empty: empty,
  reverse: reverse,
  difference: difference,
  intersection: intersection,
  union: union,
  countBy: countBy,
  groupBy: groupBy,
  fold: fold,
  fold1: fold1,
  foldl: foldl,
  foldl1: foldl1,
  foldr: foldr,
  foldr1: foldr1,
  unfoldr: unfoldr,
  andList: andList,
  orList: orList,
  any: any,
  all: all,
  unique: unique,
  sort: sort,
  sortWith: sortWith,
  sortBy: sortBy,
  sum: sum,
  product: product,
  mean: mean,
  average: average,
  concat: concat,
  concatMap: concatMap,
  flatten: flatten,
  maximum: maximum,
  minimum: minimum,
  scan: scan,
  scan1: scan1,
  scanl: scanl,
  scanl1: scanl1,
  scanr: scanr,
  scanr1: scanr1,
  slice: slice,
  take: take,
  drop: drop,
  splitAt: splitAt,
  takeWhile: takeWhile,
  dropWhile: dropWhile,
  span: span,
  breakList: breakList,
  zip: zip,
  zipWith: zipWith,
  zipAll: zipAll,
  zipAllWith: zipAllWith
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}
function in$(x, arr){
  var i = -1, l = arr.length >>> 0;
  while (++i < l) if (x === arr[i] && i in arr) return true;
  return false;
}
function compose$(fs){
  return function(){
    var i, args = arguments;
    for (i = fs.length; i > 0; --i) { args = [fs[i-1].apply(this, args)]; }
    return args[0];
  };
}
function not$(x){ return !x; }

},{}],25:[function(require,module,exports){
var max, min, negate, abs, signum, quot, rem, div, mod, recip, pi, tau, exp, sqrt, ln, pow, sin, tan, cos, asin, acos, atan, atan2, truncate, round, ceiling, floor, isItNaN, even, odd, gcd, lcm;
max = curry$(function(x$, y$){
  return x$ > y$ ? x$ : y$;
});
min = curry$(function(x$, y$){
  return x$ < y$ ? x$ : y$;
});
negate = function(x){
  return -x;
};
abs = Math.abs;
signum = function(x){
  if (x < 0) {
    return -1;
  } else if (x > 0) {
    return 1;
  } else {
    return 0;
  }
};
quot = curry$(function(x, y){
  return ~~(x / y);
});
rem = curry$(function(x$, y$){
  return x$ % y$;
});
div = curry$(function(x, y){
  return Math.floor(x / y);
});
mod = curry$(function(x$, y$){
  var ref$;
  return ((x$) % (ref$ = y$) + ref$) % ref$;
});
recip = (function(it){
  return 1 / it;
});
pi = Math.PI;
tau = pi * 2;
exp = Math.exp;
sqrt = Math.sqrt;
ln = Math.log;
pow = curry$(function(x$, y$){
  return Math.pow(x$, y$);
});
sin = Math.sin;
tan = Math.tan;
cos = Math.cos;
asin = Math.asin;
acos = Math.acos;
atan = Math.atan;
atan2 = curry$(function(x, y){
  return Math.atan2(x, y);
});
truncate = function(x){
  return ~~x;
};
round = Math.round;
ceiling = Math.ceil;
floor = Math.floor;
isItNaN = function(x){
  return x !== x;
};
even = function(x){
  return x % 2 === 0;
};
odd = function(x){
  return x % 2 !== 0;
};
gcd = curry$(function(x, y){
  var z;
  x = Math.abs(x);
  y = Math.abs(y);
  while (y !== 0) {
    z = x % y;
    x = y;
    y = z;
  }
  return x;
});
lcm = curry$(function(x, y){
  return Math.abs(Math.floor(x / gcd(x, y) * y));
});
module.exports = {
  max: max,
  min: min,
  negate: negate,
  abs: abs,
  signum: signum,
  quot: quot,
  rem: rem,
  div: div,
  mod: mod,
  recip: recip,
  pi: pi,
  tau: tau,
  exp: exp,
  sqrt: sqrt,
  ln: ln,
  pow: pow,
  sin: sin,
  tan: tan,
  cos: cos,
  acos: acos,
  asin: asin,
  atan: atan,
  atan2: atan2,
  truncate: truncate,
  round: round,
  ceiling: ceiling,
  floor: floor,
  isItNaN: isItNaN,
  even: even,
  odd: odd,
  gcd: gcd,
  lcm: lcm
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

},{}],26:[function(require,module,exports){
var values, keys, pairsToObj, objToPairs, listsToObj, objToLists, empty, each, map, compact, filter, reject, partition, find;
values = function(object){
  var i$, x, results$ = [];
  for (i$ in object) {
    x = object[i$];
    results$.push(x);
  }
  return results$;
};
keys = function(object){
  var x, results$ = [];
  for (x in object) {
    results$.push(x);
  }
  return results$;
};
pairsToObj = function(object){
  var i$, len$, x, results$ = {};
  for (i$ = 0, len$ = object.length; i$ < len$; ++i$) {
    x = object[i$];
    results$[x[0]] = x[1];
  }
  return results$;
};
objToPairs = function(object){
  var key, value, results$ = [];
  for (key in object) {
    value = object[key];
    results$.push([key, value]);
  }
  return results$;
};
listsToObj = curry$(function(keys, values){
  var i$, len$, i, key, results$ = {};
  for (i$ = 0, len$ = keys.length; i$ < len$; ++i$) {
    i = i$;
    key = keys[i$];
    results$[key] = values[i];
  }
  return results$;
});
objToLists = function(objectect){
  var keys, values, key, value;
  keys = [];
  values = [];
  for (key in objectect) {
    value = objectect[key];
    keys.push(key);
    values.push(value);
  }
  return [keys, values];
};
empty = function(object){
  var x;
  for (x in object) {
    return false;
  }
  return true;
};
each = curry$(function(f, object){
  var i$, x;
  for (i$ in object) {
    x = object[i$];
    f(x);
  }
  return object;
});
map = curry$(function(f, object){
  var k, x, results$ = {};
  for (k in object) {
    x = object[k];
    results$[k] = f(x);
  }
  return results$;
});
compact = curry$(function(object){
  var k, x, results$ = {};
  for (k in object) {
    x = object[k];
if (x) {
      results$[k] = x;
    }
  }
  return results$;
});
filter = curry$(function(f, object){
  var k, x, results$ = {};
  for (k in object) {
    x = object[k];
if (f(x)) {
      results$[k] = x;
    }
  }
  return results$;
});
reject = curry$(function(f, object){
  var k, x, results$ = {};
  for (k in object) {
    x = object[k];
if (!f(x)) {
      results$[k] = x;
    }
  }
  return results$;
});
partition = curry$(function(f, object){
  var passed, failed, k, x;
  passed = {};
  failed = {};
  for (k in object) {
    x = object[k];
    (f(x) ? passed : failed)[k] = x;
  }
  return [passed, failed];
});
find = curry$(function(f, object){
  var i$, x;
  for (i$ in object) {
    x = object[i$];
    if (f(x)) {
      return x;
    }
  }
});
module.exports = {
  values: values,
  keys: keys,
  pairsToObj: pairsToObj,
  objToPairs: objToPairs,
  listsToObj: listsToObj,
  objToLists: objToLists,
  empty: empty,
  each: each,
  map: map,
  filter: filter,
  compact: compact,
  reject: reject,
  partition: partition,
  find: find
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

},{}],27:[function(require,module,exports){
var split, join, lines, unlines, words, unwords, chars, unchars, reverse, repeat;
split = curry$(function(sep, str){
  return str.split(sep);
});
join = curry$(function(sep, xs){
  return xs.join(sep);
});
lines = function(str){
  if (!str.length) {
    return [];
  }
  return str.split('\n');
};
unlines = function(it){
  return it.join('\n');
};
words = function(str){
  if (!str.length) {
    return [];
  }
  return str.split(/[ ]+/);
};
unwords = function(it){
  return it.join(' ');
};
chars = function(it){
  return it.split('');
};
unchars = function(it){
  return it.join('');
};
reverse = function(str){
  return str.split('').reverse().join('');
};
repeat = curry$(function(n, str){
  var out, res$, i$;
  res$ = [];
  for (i$ = 0; i$ < n; ++i$) {
    res$.push(str);
  }
  out = res$;
  return out.join('');
});
module.exports = {
  split: split,
  join: join,
  lines: lines,
  unlines: unlines,
  words: words,
  unwords: unwords,
  chars: chars,
  unchars: unchars,
  reverse: reverse,
  repeat: repeat
};
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

},{}],28:[function(require,module,exports){
var Func, List, Obj, Str, Num, id, isType, replicate, prelude, toString$ = {}.toString;
Func = require('./Func.js');
List = require('./List.js');
Obj = require('./Obj.js');
Str = require('./Str.js');
Num = require('./Num.js');
id = function(x){
  return x;
};
isType = curry$(function(type, x){
  return toString$.call(x).slice(8, -1) === type;
});
replicate = curry$(function(n, x){
  var i$, results$ = [];
  for (i$ = 0; i$ < n; ++i$) {
    results$.push(x);
  }
  return results$;
});
Str.empty = List.empty;
Str.slice = List.slice;
Str.take = List.take;
Str.drop = List.drop;
Str.splitAt = List.splitAt;
Str.takeWhile = List.takeWhile;
Str.dropWhile = List.dropWhile;
Str.span = List.span;
Str.breakStr = List.breakList;
prelude = {
  Func: Func,
  List: List,
  Obj: Obj,
  Str: Str,
  Num: Num,
  id: id,
  isType: isType,
  replicate: replicate
};
prelude.each = List.each;
prelude.map = List.map;
prelude.filter = List.filter;
prelude.compact = List.compact;
prelude.reject = List.reject;
prelude.partition = List.partition;
prelude.find = List.find;
prelude.head = List.head;
prelude.first = List.first;
prelude.tail = List.tail;
prelude.last = List.last;
prelude.initial = List.initial;
prelude.empty = List.empty;
prelude.reverse = List.reverse;
prelude.difference = List.difference;
prelude.intersection = List.intersection;
prelude.union = List.union;
prelude.countBy = List.countBy;
prelude.groupBy = List.groupBy;
prelude.fold = List.fold;
prelude.foldl = List.foldl;
prelude.fold1 = List.fold1;
prelude.foldl1 = List.foldl1;
prelude.foldr = List.foldr;
prelude.foldr1 = List.foldr1;
prelude.unfoldr = List.unfoldr;
prelude.andList = List.andList;
prelude.orList = List.orList;
prelude.any = List.any;
prelude.all = List.all;
prelude.unique = List.unique;
prelude.sort = List.sort;
prelude.sortWith = List.sortWith;
prelude.sortBy = List.sortBy;
prelude.sum = List.sum;
prelude.product = List.product;
prelude.mean = List.mean;
prelude.average = List.average;
prelude.concat = List.concat;
prelude.concatMap = List.concatMap;
prelude.flatten = List.flatten;
prelude.maximum = List.maximum;
prelude.minimum = List.minimum;
prelude.scan = List.scan;
prelude.scanl = List.scanl;
prelude.scan1 = List.scan1;
prelude.scanl1 = List.scanl1;
prelude.scanr = List.scanr;
prelude.scanr1 = List.scanr1;
prelude.slice = List.slice;
prelude.take = List.take;
prelude.drop = List.drop;
prelude.splitAt = List.splitAt;
prelude.takeWhile = List.takeWhile;
prelude.dropWhile = List.dropWhile;
prelude.span = List.span;
prelude.breakList = List.breakList;
prelude.zip = List.zip;
prelude.zipWith = List.zipWith;
prelude.zipAll = List.zipAll;
prelude.zipAllWith = List.zipAllWith;
prelude.apply = Func.apply;
prelude.curry = Func.curry;
prelude.flip = Func.flip;
prelude.fix = Func.fix;
prelude.split = Str.split;
prelude.join = Str.join;
prelude.lines = Str.lines;
prelude.unlines = Str.unlines;
prelude.words = Str.words;
prelude.unwords = Str.unwords;
prelude.chars = Str.chars;
prelude.unchars = Str.unchars;
prelude.values = Obj.values;
prelude.keys = Obj.keys;
prelude.pairsToObj = Obj.pairsToObj;
prelude.objToPairs = Obj.objToPairs;
prelude.listsToObj = Obj.listsToObj;
prelude.objToLists = Obj.objToLists;
prelude.max = Num.max;
prelude.min = Num.min;
prelude.negate = Num.negate;
prelude.abs = Num.abs;
prelude.signum = Num.signum;
prelude.quot = Num.quot;
prelude.rem = Num.rem;
prelude.div = Num.div;
prelude.mod = Num.mod;
prelude.recip = Num.recip;
prelude.pi = Num.pi;
prelude.tau = Num.tau;
prelude.exp = Num.exp;
prelude.sqrt = Num.sqrt;
prelude.ln = Num.ln;
prelude.pow = Num.pow;
prelude.sin = Num.sin;
prelude.tan = Num.tan;
prelude.cos = Num.cos;
prelude.acos = Num.acos;
prelude.asin = Num.asin;
prelude.atan = Num.atan;
prelude.atan2 = Num.atan2;
prelude.truncate = Num.truncate;
prelude.round = Num.round;
prelude.ceiling = Num.ceiling;
prelude.floor = Num.floor;
prelude.isItNaN = Num.isItNaN;
prelude.even = Num.even;
prelude.odd = Num.odd;
prelude.gcd = Num.gcd;
prelude.lcm = Num.lcm;
prelude.VERSION = '1.0.3';
module.exports = prelude;
function curry$(f, bound){
  var context,
  _curry = function(args) {
    return f.length > 1 ? function(){
      var params = args ? args.concat() : [];
      context = bound ? context || this : this;
      return params.push.apply(params, arguments) <
          f.length && arguments.length ?
        _curry.call(context, params) : f.apply(context, params);
    } : f;
  };
  return _curry();
}

},{"./Func.js":23,"./List.js":24,"./Num.js":25,"./Obj.js":26,"./Str.js":27}],29:[function(require,module,exports){
module.exports = require('./lib/extend');


},{"./lib/extend":30}],30:[function(require,module,exports){
/*!
 * node.extend
 * Copyright 2011, John Resig
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://jquery.org/license
 *
 * @fileoverview
 * Port of jQuery.extend that actually works on node.js
 */
var is = require('is');

function extend() {
  var target = arguments[0] || {};
  var i = 1;
  var length = arguments.length;
  var deep = false;
  var options, name, src, copy, copy_is_array, clone;

  // Handle a deep copy situation
  if (typeof target === 'boolean') {
    deep = target;
    target = arguments[1] || {};
    // skip the boolean and the target
    i = 2;
  }

  // Handle case when target is a string or something (possible in deep copy)
  if (typeof target !== 'object' && !is.fn(target)) {
    target = {};
  }

  for (; i < length; i++) {
    // Only deal with non-null/undefined values
    options = arguments[i]
    if (options != null) {
      if (typeof options === 'string') {
          options = options.split('');
      }
      // Extend the base object
      for (name in options) {
        src = target[name];
        copy = options[name];

        // Prevent never-ending loop
        if (target === copy) {
          continue;
        }

        // Recurse if we're merging plain objects or arrays
        if (deep && copy && (is.hash(copy) || (copy_is_array = is.array(copy)))) {
          if (copy_is_array) {
            copy_is_array = false;
            clone = src && is.array(src) ? src : [];
          } else {
            clone = src && is.hash(src) ? src : {};
          }

          // Never move original objects, clone them
          target[name] = extend(deep, clone, copy);

        // Don't bring in undefined values
        } else if (typeof copy !== 'undefined') {
          target[name] = copy;
        }
      }
    }
  }

  // Return the modified object
  return target;
};

/**
 * @public
 */
extend.version = '1.0.8';

/**
 * Exports module.
 */
module.exports = extend;


},{"is":31}],31:[function(require,module,exports){

/**!
 * is
 * the definitive JavaScript type testing library
 * 
 * @copyright 2013 Enrico Marino
 * @license MIT
 */

var objProto = Object.prototype;
var owns = objProto.hasOwnProperty;
var toString = objProto.toString;
var isActualNaN = function (value) {
  return value !== value;
};
var NON_HOST_TYPES = {
  "boolean": 1,
  "number": 1,
  "string": 1,
  "undefined": 1
};

/**
 * Expose `is`
 */

var is = module.exports = {};

/**
 * Test general.
 */

/**
 * is.type
 * Test if `value` is a type of `type`.
 *
 * @param {Mixed} value value to test
 * @param {String} type type
 * @return {Boolean} true if `value` is a type of `type`, false otherwise
 * @api public
 */

is.a =
is.type = function (value, type) {
  return typeof value === type;
};

/**
 * is.defined
 * Test if `value` is defined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is defined, false otherwise
 * @api public
 */

is.defined = function (value) {
  return value !== undefined;
};

/**
 * is.empty
 * Test if `value` is empty.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is empty, false otherwise
 * @api public
 */

is.empty = function (value) {
  var type = toString.call(value);
  var key;

  if ('[object Array]' === type || '[object Arguments]' === type) {
    return value.length === 0;
  }

  if ('[object Object]' === type) {
    for (key in value) if (owns.call(value, key)) return false;
    return true;
  }

  if ('[object String]' === type) {
    return '' === value;
  }

  return false;
};

/**
 * is.equal
 * Test if `value` is equal to `other`.
 *
 * @param {Mixed} value value to test
 * @param {Mixed} other value to compare with
 * @return {Boolean} true if `value` is equal to `other`, false otherwise
 */

is.equal = function (value, other) {
  var type = toString.call(value)
  var key;

  if (type !== toString.call(other)) {
    return false;
  }

  if ('[object Object]' === type) {
    for (key in value) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if ('[object Array]' === type) {
    key = value.length;
    if (key !== other.length) {
      return false;
    }
    while (--key) {
      if (!is.equal(value[key], other[key])) {
        return false;
      }
    }
    return true;
  }

  if ('[object Function]' === type) {
    return value.prototype === other.prototype;
  }

  if ('[object Date]' === type) {
    return value.getTime() === other.getTime();
  }

  return value === other;
};

/**
 * is.hosted
 * Test if `value` is hosted by `host`.
 *
 * @param {Mixed} value to test
 * @param {Mixed} host host to test with
 * @return {Boolean} true if `value` is hosted by `host`, false otherwise
 * @api public
 */

is.hosted = function (value, host) {
  var type = typeof host[value];
  return type === 'object' ? !!host[value] : !NON_HOST_TYPES[type];
};

/**
 * is.instance
 * Test if `value` is an instance of `constructor`.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an instance of `constructor`
 * @api public
 */

is.instance = is['instanceof'] = function (value, constructor) {
  return value instanceof constructor;
};

/**
 * is.null
 * Test if `value` is null.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is null, false otherwise
 * @api public
 */

is['null'] = function (value) {
  return value === null;
};

/**
 * is.undefined
 * Test if `value` is undefined.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is undefined, false otherwise
 * @api public
 */

is.undefined = function (value) {
  return value === undefined;
};

/**
 * Test arguments.
 */

/**
 * is.arguments
 * Test if `value` is an arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arguments = function (value) {
  var isStandardArguments = '[object Arguments]' === toString.call(value);
  var isOldArguments = !is.array(value) && is.arraylike(value) && is.object(value) && is.fn(value.callee);
  return isStandardArguments || isOldArguments;
};

/**
 * Test array.
 */

/**
 * is.array
 * Test if 'value' is an array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an array, false otherwise
 * @api public
 */

is.array = function (value) {
  return '[object Array]' === toString.call(value);
};

/**
 * is.arguments.empty
 * Test if `value` is an empty arguments object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty arguments object, false otherwise
 * @api public
 */
is.arguments.empty = function (value) {
  return is.arguments(value) && value.length === 0;
};

/**
 * is.array.empty
 * Test if `value` is an empty array.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an empty array, false otherwise
 * @api public
 */
is.array.empty = function (value) {
  return is.array(value) && value.length === 0;
};

/**
 * is.arraylike
 * Test if `value` is an arraylike object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an arguments object, false otherwise
 * @api public
 */

is.arraylike = function (value) {
  return !!value && !is.boolean(value)
    && owns.call(value, 'length')
    && isFinite(value.length)
    && is.number(value.length)
    && value.length >= 0;
};

/**
 * Test boolean.
 */

/**
 * is.boolean
 * Test if `value` is a boolean.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a boolean, false otherwise
 * @api public
 */

is.boolean = function (value) {
  return '[object Boolean]' === toString.call(value);
};

/**
 * is.false
 * Test if `value` is false.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is false, false otherwise
 * @api public
 */

is['false'] = function (value) {
  return is.boolean(value) && (value === false || value.valueOf() === false);
};

/**
 * is.true
 * Test if `value` is true.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is true, false otherwise
 * @api public
 */

is['true'] = function (value) {
  return is.boolean(value) && (value === true || value.valueOf() === true);
};

/**
 * Test date.
 */

/**
 * is.date
 * Test if `value` is a date.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a date, false otherwise
 * @api public
 */

is.date = function (value) {
  return '[object Date]' === toString.call(value);
};

/**
 * Test element.
 */

/**
 * is.element
 * Test if `value` is an html element.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an HTML Element, false otherwise
 * @api public
 */

is.element = function (value) {
  return value !== undefined
    && typeof HTMLElement !== 'undefined'
    && value instanceof HTMLElement
    && value.nodeType === 1;
};

/**
 * Test error.
 */

/**
 * is.error
 * Test if `value` is an error object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an error object, false otherwise
 * @api public
 */

is.error = function (value) {
  return '[object Error]' === toString.call(value);
};

/**
 * Test function.
 */

/**
 * is.fn / is.function (deprecated)
 * Test if `value` is a function.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a function, false otherwise
 * @api public
 */

is.fn = is['function'] = function (value) {
  var isAlert = typeof window !== 'undefined' && value === window.alert;
  return isAlert || '[object Function]' === toString.call(value);
};

/**
 * Test number.
 */

/**
 * is.number
 * Test if `value` is a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a number, false otherwise
 * @api public
 */

is.number = function (value) {
  return '[object Number]' === toString.call(value);
};

/**
 * is.infinite
 * Test if `value` is positive or negative infinity.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is positive or negative Infinity, false otherwise
 * @api public
 */
is.infinite = function (value) {
  return value === Infinity || value === -Infinity;
};

/**
 * is.decimal
 * Test if `value` is a decimal number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a decimal number, false otherwise
 * @api public
 */

is.decimal = function (value) {
  return is.number(value) && !isActualNaN(value) && !is.infinite(value) && value % 1 !== 0;
};

/**
 * is.divisibleBy
 * Test if `value` is divisible by `n`.
 *
 * @param {Number} value value to test
 * @param {Number} n dividend
 * @return {Boolean} true if `value` is divisible by `n`, false otherwise
 * @api public
 */

is.divisibleBy = function (value, n) {
  var isDividendInfinite = is.infinite(value);
  var isDivisorInfinite = is.infinite(n);
  var isNonZeroNumber = is.number(value) && !isActualNaN(value) && is.number(n) && !isActualNaN(n) && n !== 0;
  return isDividendInfinite || isDivisorInfinite || (isNonZeroNumber && value % n === 0);
};

/**
 * is.int
 * Test if `value` is an integer.
 *
 * @param value to test
 * @return {Boolean} true if `value` is an integer, false otherwise
 * @api public
 */

is.int = function (value) {
  return is.number(value) && !isActualNaN(value) && value % 1 === 0;
};

/**
 * is.maximum
 * Test if `value` is greater than 'others' values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is greater than `others` values
 * @api public
 */

is.maximum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value < others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.minimum
 * Test if `value` is less than `others` values.
 *
 * @param {Number} value value to test
 * @param {Array} others values to compare with
 * @return {Boolean} true if `value` is less than `others` values
 * @api public
 */

is.minimum = function (value, others) {
  if (isActualNaN(value)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.arraylike(others)) {
    throw new TypeError('second argument must be array-like');
  }
  var len = others.length;

  while (--len >= 0) {
    if (value > others[len]) {
      return false;
    }
  }

  return true;
};

/**
 * is.nan
 * Test if `value` is not a number.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is not a number, false otherwise
 * @api public
 */

is.nan = function (value) {
  return !is.number(value) || value !== value;
};

/**
 * is.even
 * Test if `value` is an even number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an even number, false otherwise
 * @api public
 */

is.even = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 === 0);
};

/**
 * is.odd
 * Test if `value` is an odd number.
 *
 * @param {Number} value value to test
 * @return {Boolean} true if `value` is an odd number, false otherwise
 * @api public
 */

is.odd = function (value) {
  return is.infinite(value) || (is.number(value) && value === value && value % 2 !== 0);
};

/**
 * is.ge
 * Test if `value` is greater than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.ge = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value >= other;
};

/**
 * is.gt
 * Test if `value` is greater than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean}
 * @api public
 */

is.gt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value > other;
};

/**
 * is.le
 * Test if `value` is less than or equal to `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if 'value' is less than or equal to 'other'
 * @api public
 */

is.le = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value <= other;
};

/**
 * is.lt
 * Test if `value` is less than `other`.
 *
 * @param {Number} value value to test
 * @param {Number} other value to compare with
 * @return {Boolean} if `value` is less than `other`
 * @api public
 */

is.lt = function (value, other) {
  if (isActualNaN(value) || isActualNaN(other)) {
    throw new TypeError('NaN is not a valid value');
  }
  return !is.infinite(value) && !is.infinite(other) && value < other;
};

/**
 * is.within
 * Test if `value` is within `start` and `finish`.
 *
 * @param {Number} value value to test
 * @param {Number} start lower bound
 * @param {Number} finish upper bound
 * @return {Boolean} true if 'value' is is within 'start' and 'finish'
 * @api public
 */
is.within = function (value, start, finish) {
  if (isActualNaN(value) || isActualNaN(start) || isActualNaN(finish)) {
    throw new TypeError('NaN is not a valid value');
  } else if (!is.number(value) || !is.number(start) || !is.number(finish)) {
    throw new TypeError('all arguments must be numbers');
  }
  var isAnyInfinite = is.infinite(value) || is.infinite(start) || is.infinite(finish);
  return isAnyInfinite || (value >= start && value <= finish);
};

/**
 * Test object.
 */

/**
 * is.object
 * Test if `value` is an object.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is an object, false otherwise
 * @api public
 */

is.object = function (value) {
  return value && '[object Object]' === toString.call(value);
};

/**
 * is.hash
 * Test if `value` is a hash - a plain object literal.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a hash, false otherwise
 * @api public
 */

is.hash = function (value) {
  return is.object(value) && value.constructor === Object && !value.nodeType && !value.setInterval;
};

/**
 * Test regexp.
 */

/**
 * is.regexp
 * Test if `value` is a regular expression.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if `value` is a regexp, false otherwise
 * @api public
 */

is.regexp = function (value) {
  return '[object RegExp]' === toString.call(value);
};

/**
 * Test string.
 */

/**
 * is.string
 * Test if `value` is a string.
 *
 * @param {Mixed} value value to test
 * @return {Boolean} true if 'value' is a string, false otherwise
 * @api public
 */

is.string = function (value) {
  return '[object String]' === toString.call(value);
};


},{}],32:[function(require,module,exports){
module.exports={
	"Opera Mini": [{
		"fill": "audio:not([controls]) main subline"
	}],
	"Opera Mobile": [{
		"fill": "audio:not([controls]) main subline"
	}],
	"Opera": [{
		"min": "10",
		"max": "11.64",
		"fill": "details figure main subline summary"
	}, {
		"min": "10",
		"max": "10.63",
		"fill": "audio[controls] article aside canvas figcaption figure footer header hgroup nav section template"
	}, {
		"min": "15",
		"fill": "subline"
	}],
	"Android": [{
		"fill": "main subline"
	}],
	"BlackBerry": [{
		"fill": "main subline"
	}],
	"Chrome iOS": [{
		"fill": "audio:not([controls]) main subline"
	}],
	"Safari iOS": [{
		"fill": "audio:not([controls]) main subline"
	}],
	"Chrome": [{
		"fill": "abbr[title] subline"
	}],
	"Internet Explorer": [{
		"min": "6",
		"fill": "details main subline summary"
	}, {
		"min": "6",
		"max": "9",
		"fill": "article aside figcaption figure footer header hgroup img legend mark nav section template _textarea"
	}, {
		"min": "6",
		"max": "8",
		"fill": "_audio canvas -ms-placeholder video"
	}, {
		"min": "6",
		"max": "7",
		"fill": "button dd dl form h1 h2 h3 h4 h5 h6 input _legend menu ol p _pre select ul"
	}, {
		"only": "6",
		"fill": "_abbr _code _kbd _samp"
	}, {
		"min": "7",
		"max": "9",
		"fill": "[hidden] abbr[title]"
	}, {
		"only": "7",
		"fill": "_button _input[type=\"button\"] _input[type=\"checkbox\"] _input[type=\"radio\"] _input[type=\"reset\"] _input[type=\"submit\"]"
	}, {
		"min": "8",
		"max": "9",
		"fill": "input[type=\"checkbox\"] input[type=\"radio\"]"
	}, {
		"only": "9",
		"fill": "audio:not([controls]) svg:not(:root)"
	}, {
		"only": "10",
		"fill": "img"
	}],
	"Firefox": [{
		"min": "3",
		"fill": "details summary subline"
	}, {
		"min": "3",
		"max": "20",
		"fill": "main"
	}, {
		"min": "3",
		"max": "3.6",
		"fill": "audio article aside b canvas figcaption figure footer header hgroup __legend nav section strong video"
	}],
	"Safari": [{
		"min": "3",
		"fill": "main subline"
	}, {
		"min": "3",
		"max": "5.1",
		"fill": "abbr[title] article aside audio canvas code details dfn figcaption figure footer header hgroup kbd nav pre samp section summary video"
	}]
}
},{}],33:[function(require,module,exports){
module.exports={
	"Opera Mini": [{
		"fill": "Window.prototype.matchMedia Element.prototype.matches.o Element.prototype.mutation"
	}],
	"Opera Mobile": [{
		"min": "10",
		"max": "12",
		"fill": "Window.prototype.matchMedia"
	}, {
		"fill": "Element.prototype.matches.o"
	}],
	"Opera": [{
		"only": "11.5",
		"fill": "Object.defineProperty Object.defineProperties"
	}, {
		"min": "11.5",
		"max": "12.1",
		"fill": "Window.prototype.matchMedia Element.prototype.matches.o Element.prototype.mutation"
	}, {
		"only": "15",
		"fill": "Navigator.prototype.geolocation"
	}, {
		"min": "15",
		"fill": "Element.prototype.matches.webkit Element.prototype.mutation.blink"
	}],
	"Android": [{
		"min": "2.1",
		"max": "2.3",
		"fill": "Window.prototype.matchMedia"
	}, {
		"fill": "Element.prototype.matches.webkit Element.prototype.mutation"
	}],
	"BlackBerry": [{
		"only": "7",
		"fill": "Window.prototype.matchMedia"
	}, {
		"fill": "Element.prototype.matches.webkit Element.prototype.mutation"
	}],
	"Chrome iOS": [{
		"fill": "Element.prototype.matches.webkit Element.prototype.mutation"
	}],
	"Safari iOS": [{
		"max": "4.3",
		"fill": "Object.defineProperty Object.defineProperties"
	}, {
		"fill": "Window.prototype.devicePixelRatio.iossafari6 Element.prototype.matches.webkit Element.prototype.mutation"
	}],
	"Chrome": [{
		"fill": "Element.prototype.matches.webkit Element.prototype.mutation.blink"
	}],
	"Internet Explorer": [{
		"min": "6",
		"max": "7",
		"fill": "Object.create.ie7 Object.defineProperty.ie7 Object.defineProperties Object.getPrototypeOf Object.keys Object.getOwnPropertyNames Date.prototype.toISOString Date.now Array.isArray Function.prototype.bind String.prototype.trim Array.prototype.every Array.prototype.filter Array.prototype.forEach Array.prototype.indexOf Array.prototype.lastIndexOf Array.prototype.map Array.prototype.reduce Array.prototype.reduceRight Array.prototype.some Window.polyfill.ie7 Window.prototype.base64 Window.prototype.devicePixelRatio.ie7 Window.prototype.DOMTokenList Window.prototype.Event.ie8 Window.prototype.Event.ie8.DOMContentLoaded Window.prototype.Event.hashchange Window.prototype.getComputedStyle.ie8 Window.prototype.JSON Window.prototype.localStorage.ie7 Window.prototype.matchMedia Window.prototype.viewport.ie7 Window.prototype.XMLHttpRequest.ie7 Window.prototype.XMLHttpRequest.ie8 Navigator.prototype.geolocation Element.prototype.classList.ie7 Element.prototype.matches Element.prototype.mutation Element.prototype.placeholder.ie7 Window.polyfill.ie7.init"
	}, {
		"only": "8",
		"fill": "Object.create Object.defineProperty.ie8 Object.defineProperties Object.getPrototypeOf Object.keys Object.getOwnPropertyNames Date.prototype.toISOString Date.now Array.isArray Function.prototype.bind String.prototype.trim Array.prototype.every Array.prototype.filter Array.prototype.forEach Array.prototype.indexOf Array.prototype.lastIndexOf Array.prototype.map Array.prototype.reduce Array.prototype.reduceRight Array.prototype.some Window.polyfill.ie8 Window.prototype.base64 Window.prototype.devicePixelRatio.ie8 Window.prototype.DOMTokenList Window.prototype.Event.ie8 Window.prototype.Event.ie8.DOMContentLoaded Window.prototype.getComputedStyle.ie8 Window.prototype.matchMedia Window.prototype.viewport Window.prototype.XMLHttpRequest.ie8 Navigator.prototype.geolocation HTMLDocument.prototype.head Element.prototype.classList Element.prototype.matches Element.prototype.mutation Element.prototype.placeholder Window.polyfill.ie8.init"
	}, {
		"min": "9",
		"max": "10",
		"fill": "Window.prototype.Event Window.prototype.CustomEvent Window.prototype.scroll HTMLDocument"
	}, {
		"only": "9",
		"fill": "Window.prototype.base64 Window.prototype.DOMTokenList Window.prototype.matchMedia Element.prototype.classList"
	}, {
		"min": "9",
		"fill": "Element.prototype.matches.ms Element.prototype.mutation"
	}],
	"Firefox": [{
		"only": "3.6",
		"fill": "Object.create Object.defineProperty Object.defineProperties Object.getPrototypeOf Object.keys Object.getOwnPropertyNames Array.isArray Function.prototype.bind"
	}, {
		"min": "3.6",
		"max": "5",
		"fill": "Window.prototype.Event Window.prototype.CustomEvent Window.prototype.matchMedia Window.prototype.Event.firefox5"
	}, {
		"min": "3.6",
		"fill": "Element.prototype.matches.moz Element.prototype.mutation Window.prototype.Event.focus"
	}],
	"Safari": [{
		"only": "4",
		"fill": "Array.isArray Object.create Object.defineProperty Object.defineProperties Object.getOwnPropertyNames Object.getPrototypeOf Object.keys Function.prototype.bind String.prototype.trim Window.polyfill.safari4 Window.prototype.DOMTokenList Window.prototype.Event Window.prototype.CustomEvent Window.prototype.Event.hashchange Navigator.prototype.geolocation HTMLDocument.prototype.head Element.prototype.classList"
	}, {
		"min": "5",
		"max": "5.1",
		"fill": "Function.prototype.bind"
	}, {
		"min": "4",
		"max": "5",
		"fill": "Window.prototype.matchMedia"
	}, {
		"min": "4",
		"fill": "Window.prototype.devicePixelRatio.safari6 Element.prototype.matches.webkit Element.prototype.mutation"
	}]
}
},{}],34:[function(require,module,exports){
module.exports={
	"Opera Mini": ["\\sOpera\\sMini\\/(\\d+\\.?\\d*)"],
	"Opera Mobile": ["\\sOpera\\sMobi\\/.+?Version\\/(\\d+\\.?\\d*)"],
	"Opera": ["\\sOPR\\/(\\d+\\.?\\d*)", "^Opera\\/.+?Version\\/(\\d+\\.?\\d*)", "\\sOpera\\s(\\d+\\.?\\d*)"],
	"Android": ["\\sAndroid\\s(\\d+\\.?\\d*)"],
	"BlackBerry": ["\\(BB\\d+\\.?\\d*;.+?\\sVersion\\/(\\d+\\.?\\d*)", "\\(BlackBerry;.+?\\sVersion\\/(\\d+\\.?\\d*)"],
	"Chrome iOS": ["\\sCriOS\\/(\\d+\\.?\\d*)"],
	"Safari iOS": ["\\(iPad.+?\\Version\\/(\\d+\\.?\\d*).+?\\sSafari\\/", "\\(iPhone.+?\\Version\\/(\\d+\\.?\\d*).+?\\sSafari\\/", "iPhone\\sOS\\s(\\d+)"],
	"Chrome": ["\\sChrome\\/(\\d+\\.?\\d*)"],
	"Internet Explorer": ["\\sTrident\\/.+?rv[:\\s](\\d+\\.?\\d*)", "\\sMSIE\\s(\\d+\\.?\\d*)"],
	"Firefox": ["\\s[Ff]irefox[\\/\\s\\(\\/]?(\\d+\\.?\\d*)"],
	"Safari": ["\\sVersion\\/(\\d+\\.?\\d*).+?Safari\\/[\\d\\.]+$"]
}
},{}],35:[function(require,module,exports){
(function (__dirname){
var fs = require('fs');
var join = require('path').join;

exports.agent = {
  js: require('./agent.js.json'),
  css: require('./agent.css.json'),
};

exports.useragent = require('./agent.json');
exports.normalize = require('./normalize.json');

// map lookup for sources with aliases
// source[name] = js string
var source = exports.source = {};
var sourceFolder = join(__dirname, 'source');

fs.readdirSync && fs.readdirSync(sourceFolder).forEach(function (filename) {
  if (filename[0] === '.') return;

  source[filename.replace(/\.js$/, '')] = fs.readFileSync(join(sourceFolder, filename), 'utf8');
});
}).call(this,"/../node_modules/polyfill")
},{"./agent.css.json":32,"./agent.js.json":33,"./agent.json":34,"./normalize.json":36,"fs":14,"path":16}],36:[function(require,module,exports){
module.exports={
	"[hidden] template": "display: none",
	"_abbr abbr[title]": "border-bottom: 1px dotted",
	"article aside details figcaption figure footer header hgroup main nav section subhead summary": "display: block",
	"_audio": "clip: rect(0 0 0 0); position: absolute",
	"audio[controls] canvas video": "display: inline-block",
	"audio:not([controls])": "height: 0",
	"b strong": "font-weight: bold",
	"_button _input[type=\"button\"] _input[type=\"reset\"] _input[type=\"submit\"]": "overflow: visible",
	"button figure form input select textarea": "margin: 0",
	"code kbd pre samp": "font-family: monospace serif; font-size: 1em",
	"_code _kbd _pre _samp": "font-family: \"Courier New\" monospace",
	"dd": "margin: 0 0 0 40px",
	"dfn": "font-style: italic",
	"dl h3 menu ol p _pre ul": "margin: 1em 0",
	"h1": "font-size: 2em; margin: .67em 0",
	"h2": "font-size: 1.5em; margin: .83em 0",
	"h3": "font-size: 1.17em",
	"h4": "font-size: 1em; margin: 1.33em 0",
	"h5": "font-size: .83em; margin: 1.67em 0",
	"h6": "font-size: .67em; margin: 2.33em 0",
	"_input[type=\"checkbox\"] _input[type=\"radio\"]": "height: 13px; width: 13px",
	"input[type=\"checkbox\"] input[type=\"radio\"]": "box-sizing: border-box; padding: 0",
	"img legend": "border: 0",
	"_legend": "margin-left: -7px",
	"__legend": "white-space: normal",
	"mark": "background: #FF0; color: #000",
	"menu ol ul": "padding: 0 0 0 40px",
	"-ms-placeholder": "color: #777",
	"pre": "font-size: .9em",
	"svg:not(:root)": "overflow: hidden",
	"_textarea": "overflow: auto"
}
},{}]},{},[1])
