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

var rxObject = matcherFactory('static', {
    padding: ['this', 'window'],
    objects: {
        'Object': ['assign', 'create', 'defineProperty', 'keys'],
        'Array': ['map', 'from']
    }
});

var polyfills = expressions
    .map(fold)
    .map(function (list) {
        return (list.join('.').match(rxObject) || 0)[1];
    })
    .filter(function (value) {
        return !!value;
    });

console.log(polyfills);
