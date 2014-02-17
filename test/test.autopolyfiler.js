/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var scan = require('../lib/polyfill-scan'),
    reduce = require('../lib/polyfill-reduce'),
    expect = require('chai').expect;

describe('polyfill-scan', function() {

    it('scans for prototype-based polyfills', function () {
        var polyfills = scan('"".trim();');
        expect(polyfills).to.eql(['String.prototype.trim']);
    });

    it('scans for prototype-based polyfills in deep statements', function () {
        var polyfills = scan('var x = a.b.c.d.e.f.g.trim();');
        expect(polyfills).to.eql(['String.prototype.trim']);
    });

    it('scans for prototype-based polyfills that called by call, apply or bind', function () {
        var polyfills = scan(
            '"".trim.call(" 1 ");' +
            '"".repeat.apply("1", [4]);' +
            '[].some.bind([], function () {});'
        );
        expect(polyfills).to.eql(['String.prototype.trim', 'String.prototype.repeat', 'Function.prototype.bind', 'Array.prototype.some']);
    });

    it('scans for static method polyfills', function () {
        var polyfills = scan('Object.create();');
        expect(polyfills).to.eql(['Object.create']);
    });

    it('ignores deep expressions that mocks as static methods', function () {
        var polyfills = scan('My.Object.create();Oh.My.Object.create();');
        expect(polyfills).to.eql([]);
    });

    it('scans for static method polyfills that called by call, apply or bind', function () {
        var polyfills = scan(
            'Object.create.bind(null);' +
            'Number.isNaN.apply(Number, NaN);' +
            'JSON.parse.call(JSON, "{}");'
        );
        expect(polyfills).to.eql(['Function.prototype.bind', 'Object.create', 'Number.isNaN', 'JSON.parse']);
    });

    it('scans for constructor polyfills', function () {
        var polyfills = scan('new Promise();');
        expect(polyfills).to.eql(['Promise']);
    });

    it('ignores deep expressions that mocks as constructor', function () {
        var polyfills = scan('new My.Promise();new My.Own.Promise();');
        expect(polyfills).to.eql([]);
    });

    it('returns unique polyfills', function () {
        var polyfills = scan('new Promise();new Promise();"".trim();"".trim();Object.create();Object.create();');
        expect(polyfills).to.eql(['Promise', 'String.prototype.trim', 'Object.create']);
    });

});

describe('polyfill-reduce', function() {

    it('excludes supported polyfills', function () {
        var polyfills = reduce(scan('"".trim();Object.create();new Promise();'), ['IE 11', 'Chrome >= 31']);
        expect(polyfills).to.eql(['Promise']);
    });

    it('keeps undefined polyfills', function () {
        var polyfills = reduce(['PewpewOlolo', 'JSON.parse'], ['IE 11', 'Chrome >= 31']);
        expect(polyfills).to.eql(['PewpewOlolo']);
    });

});
