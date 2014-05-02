/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var matcherGenerator = require('../' + (process.env.AUTOPOLIFILLER_COVERAGE ? 'lib-cov' : 'lib') + '/polyfill-expression-matcher'),
    expect = require('chai').expect;

describe('polyfill-expression-matcher', function() {

    describe('static', function () {
        it('generates function', function () {
            var matcher = matcherGenerator('static', {
                objects: {
                    'Object': ['keys']
                }
            });

            expect(matcher).to.be.a.function;
        });

        it('ignores empty `objects`', function () {
            expect(function () {
                matcherGenerator('static', {});
            }).to.not.throw(Error);
        });

        it('function tests static method call expression against RegExp', function () {
            var matcher = matcherGenerator('static', {
                objects: {
                    'Object': ['keys']
                }
            });

            expect(matcher('this.Object.keys')).to.eql('Object.keys');
            expect(matcher('window.Object.keys')).to.eql('Object.keys');
            expect(matcher('Object.keys.bind')).to.eql('Object.keys');
            expect(matcher('this.Object.keys.apply.call')).to.eql('Object.keys');
            expect(matcher('pewpew.Object.keys')).to.eql(void 0);
            expect(matcher('pewpew.Object')).to.eql(void 0);
            expect(matcher('pewpew.keys')).to.eql(void 0);
        });
    });

    describe('method', function () {
        it('generates function', function () {
            var matcher = matcherGenerator('method', {
                methods: ['every']
            });

            expect(matcher).to.be.a.function;
        });

        it('ignores empty `methods`', function () {
            expect(function () {
                matcherGenerator('method', {});
            }).to.not.throw(Error);
        });

        it('function tests method call expression against RegExp', function () {
            var matcher = matcherGenerator('method', {
                methods: ['every']
            });

            expect(matcher('this.array.every')).to.eql('every');
            // case ''.trim();
            expect(matcher('every')).to.eql('every');
            expect(matcher('a.every.bind')).to.eql('every');
            expect(matcher('window.object.every.apply.call')).to.eql('every');
        });
    });

    describe('global', function () {
        it('generates function', function () {
            var matcher = matcherGenerator('global', {
                methods: ['atob']
            });

            expect(matcher).to.be.a.function;
        });

        it('ignores empty `methods`', function () {
            expect(function () {
                matcherGenerator('global', {});
            }).to.not.throw(Error);
        });

        it('function tests global method call expression against RegExp', function () {
            var matcher = matcherGenerator('global', {
                methods: ['atob']
            });

            expect(matcher('this.atob')).to.eql('atob');
            expect(matcher('atob')).to.eql('atob');
            expect(matcher('window.atob.bind')).to.eql('atob');
            expect(matcher('window.atob.apply.call')).to.eql('atob');
            expect(matcher('object.atob')).to.eql(void 0);
        });
    });

    describe('constructor', function () {
        it('generates function', function () {
            var matcher = matcherGenerator('constructor', {
                constructors: ['Map']
            });

            expect(matcher).to.be.a.function;
        });

        it('ignores empty `methods`', function () {
            expect(function () {
                matcherGenerator('constructor', {});
            }).to.not.throw(Error);
        });

        it('function tests constructor call expression against RegExp', function () {
            var matcher = matcherGenerator('constructor', {
                constructors: ['Map']
            });

            expect(matcher('this.Map')).to.eql('Map');
            expect(matcher('Map')).to.eql('Map');
            expect(matcher('window.Map')).to.eql('Map');
            expect(matcher('window.Map.bind')).to.eql(void 0);
            expect(matcher('window.Map.apply.call')).to.eql(void 0);
            expect(matcher('Map.bind')).to.eql(void 0);
        });
    });

});
