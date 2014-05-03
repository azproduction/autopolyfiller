var fold = require('./fold-expression');
var grep = require('./grep-expression');
var matcherFactory = require('./matcher-factory');
var parse = require('acorn').parse;

var code = 'a.b.c();' +
    'window.ab.cd();' +
    'atob();' +
    'new Map();' +
    'this.btoa();' +
    'window.Object.keys(Array.from);' +
    'this.Array.map(Object.keys).join();';

var ast = parse(code);

var expressions = grep(ast);

var testStatic = matcherFactory('static', {
    objects: {
        'Object': ['assign', 'create', 'defineProperty', 'keys', 'values'],
        'Array': ['from']
    }
});

var testMethod = matcherFactory('method', {
    methods: ['map']
});

var testGlobal = matcherFactory('global', {
    methods: ['atob', 'btoa']
});

var polyfills = expressions
    .map(fold)
    .map(function (list) {
        var chain = list.join('.');
        return testStatic(chain) || testMethod(chain) || testGlobal(chain);
    })
    .filter(function (value) {
        return !!value;
    });

console.log(polyfills);
