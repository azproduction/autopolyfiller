/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

// Drop cache to reset polyfills
var reduceFile = '../' + (process.env.AUTOPOLIFILLER_COVERAGE ? 'lib-cov' : 'lib') + '/polyfill-reduce';
delete require.cache[require.resolve(reduceFile)];
delete require.cache[require.resolve('polyfill')];

var autopolyfiller = require('..'),
    reduce = require(reduceFile),
    polyfill = require('polyfill'),
    astQuery = require('grasp-equery').query,
    expect = require('chai').expect;

describe('autopolyfiller', function () {

    it('accepts browsers as ...rest parameter', function () {
        var polyfills = autopolyfiller('IE 11', 'Chrome >= 31').add('"".trim();').polyfills;

        expect(polyfills).to.eql([]);
    });

    it('accepts browsers as array parameter', function () {
        var polyfills = autopolyfiller(['IE 11', 'Chrome >= 31']).add('"".trim();').polyfills;

        expect(polyfills).to.eql([]);
    });

    it('[TODO] should contain all registered polyfills', function () {
        // TODO support all polyfills in polyfill module
//        var availablePolyfills = polyfill().sort(),
//            requiredPolyfills = reduce.list().sort();
//
//        requiredPolyfills.forEach(function (polyfill) {
//            expect(availablePolyfills).to.include(polyfill);
//        });
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
                    'PewPew.prototype.ololo': {
                        'chrome 20': true
                    }
                },
                polyfill: {
                    'PewPew.prototype.ololo': function () {
                        return 'PewPew.prototype.ololo = {};';
                    }
                }
            });

            var polyfills = autopolyfiller('Chrome 20').add('"".ololo();').polyfills;

            expect(polyfills).to.eql([]);
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
                    'PewPew.prototype.test': {
                        'chrome 19': true
                    }
                },
                polyfill: {
                    'PewPew.prototype.test': function () {
                        return code;
                    }
                }
            });

            var polyfillsCode = autopolyfiller('Chrome 20').add('"".test();').toString();

            expect(polyfillsCode).to.eql(code);
        });

        it('throws an error if required polyfill is not defined', function () {
            autopolyfiller.use({
                test: function (ast) {
                    return astQuery('__.undefinedPolyfill(_$)', ast).length ? ['PewPew.undefinedPolyfill'] : [];
                }
            });

            expect(function () {
                var code = autopolyfiller().add('"".undefinedPolyfill();').toString();
            }).to.throw(Error, /Unknown feature: PewPew.undefinedPolyfill/);
        });

    });

});
