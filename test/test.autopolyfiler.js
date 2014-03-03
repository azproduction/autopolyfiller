/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

// Drop cache to reset polyfills
var reduceFile = '../' + (process.env.AUTOPOLIFILLER_COVERAGE ? 'lib-cov' : 'lib') + '/polyfill-reduce';

var autopolyfiller = require('..'),
    reduce = require(reduceFile),
    polyfill = require('polyfill'),
    astQuery = require('grasp-equery').query,
    expect = require('chai').expect;

var reLocalPolyfills = /^__/;

describe('autopolyfiller', function () {

    it('accepts browsers as ...rest parameter', function () {
        var polyfills = autopolyfiller('IE 11', 'Chrome >= 31').add('"".trim();').polyfills;

        expect(polyfills).to.eql([]);
    });

    it('accepts browsers as array parameter', function () {
        var polyfills = autopolyfiller(['IE 11', 'Chrome >= 31']).add('"".trim();').polyfills;

        expect(polyfills).to.eql([]);
    });

    it('should contain all required polyfills', function () {
        var availablePolyfills = Object.keys(polyfill.source),
            requiredPolyfills = reduce.list().sort();

        requiredPolyfills.forEach(function (polyfill) {
            if (!reLocalPolyfills.test(polyfill)) {
                expect(availablePolyfills).to.include(polyfill);
            }
        });
    });

    describe('.add', function () {

        it('stores unique polyfills', function () {
            var polyfills = autopolyfiller('IE 7').add('"".trim();').add('"".trim();').polyfills;

            expect(polyfills).to.eql(['String.prototype.trim']);
        });

        it('keeps all polyfills if no browsers passed', function () {
            var polyfills = autopolyfiller().add('"".trim();').add('Object.keys();').polyfills;

            expect(polyfills).to.eql(['String.prototype.trim', 'Object.keys']);
        });

    });

    describe('.use', function () {

        it('registers matchers, support and polyfills', function () {
            autopolyfiller.use({
                test: function (ast) {
                    return astQuery('__.ololo(_$)', ast).length ? ['PewPew.prototype.ololo'] : [];
                },
                support: {
                    'Chrome': [{
                        'only': '19',
                        'fill': 'PewPew.prototype.ololo'
                    }]
                },
                polyfill: {
                    'PewPew.prototype.ololo': 'PewPew.prototype.ololo = {};'
                }
            });

            var polyfills = autopolyfiller('Chrome 19').add('"".ololo();').polyfills;

            expect(polyfills).to.eql(['PewPew.prototype.ololo']);
        });

        it('ignores absent parameters', function () {
            autopolyfiller.use({});
        });

    });

    describe('.toString', function () {

        it('returnes polyfills code as string', function () {
            var code = 'PewPew.prototype.test = {};';

            autopolyfiller.use({
                test: function (ast) {
                    return astQuery('__.test(_$)', ast).length ? ['PewPew.prototype.test'] : [];
                },
                support: {
                    'Chrome': [{
                        'only': '19',
                        'fill': 'PewPew.prototype.test'
                    }]
                },
                polyfill: {
                    'PewPew.prototype.test': code
                }
            });

            var polyfillsCode = autopolyfiller('Chrome 19').add('"".test();').toString();

            expect(polyfillsCode).to.have.string(code);
        });

        it('wraps code with conditional expression', function () {
            var polyfills = autopolyfiller('IE 7').add('"".trim();').toString();

            expect(polyfills).to.match(/String\.prototype\.trim/);
            expect(polyfills).to.match(/!String\.prototype\.trim/);
        });

    });

});
