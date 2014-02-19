/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var reduce = require('../' + (process.env.AUTOPOLIFILLER_COVERAGE ? 'lib-cov' : 'lib') + '/polyfill-reduce'),
    expect = require('chai').expect;

describe('polyfill-reduce', function() {

    it('excludes supported polyfills', function () {
        var polyfills = reduce(['Promise', 'String.prototype.trim', 'Object.create'], ['IE 11', 'Chrome >= 31']);
        expect(polyfills).to.eql(['Promise']);
    });

    it('keeps undefined polyfills', function () {
        var polyfills = reduce(['PewpewOlolo', 'JSON'], ['IE 11', 'Chrome >= 31']);
        expect(polyfills).to.eql(['PewpewOlolo']);
    });

    describe('.support', function () {

        it('uses custom supports', function () {
            reduce.support({
                'PewpewOlolo': {
                    'chrome 30': true
                }
            });
            var polyfills = reduce(['PewpewOlolo'], ['Chrome 30']);
            expect(polyfills).to.eql([]);
        });

    });

    describe('.list', function () {

        it('provides list of all registered polyfills', function () {
            expect(reduce.list()).to.be.instanceof(Array);
        });

    });

});
