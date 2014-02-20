/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var scan = require('../' + (process.env.AUTOPOLIFILLER_COVERAGE ? 'lib-cov' : 'lib') + '/polyfill-scan'),
    astQuery = require('grasp-equery').query,
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
        expect(polyfills).to.eql(['Function.prototype.bind', 'Object.create', 'Number.isNaN', 'Window.prototype.JSON']);
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

    describe('.use', function() {

        it('uses custom matches', function () {
            scan.use({
                test: function (ast) {
                    return astQuery('new PewpewOlolo(_$)', ast).length ? ['PewpewOlolo'] : [];
                }
            });
            var polyfills = scan('new PewpewOlolo();');
            expect(polyfills).to.eql(['PewpewOlolo']);
        });

    });

});
