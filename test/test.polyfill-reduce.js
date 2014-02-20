/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var reduce = require('../' + (process.env.AUTOPOLIFILLER_COVERAGE ? 'lib-cov' : 'lib') + '/polyfill-reduce'),
    autoprefixer = require('autoprefixer'),
    expect = require('chai').expect;

describe('polyfill-reduce', function() {

    it('excludes supported polyfills', function () {
        var polyfills = reduce(['Promise', 'String.prototype.trim', 'Object.create'], ['IE 11', 'Chrome >= 31']);
        expect(polyfills).to.eql(['Promise']);
    });

    it('ignores undefined browsers', function () {
        autoprefixer.data.browsers.mychrome = {
            prefix: "-webkit-",
            versions: [7, 6.1, 6, 5.1, 5, 4, 3.2, 3.1],
            popularity: [1.11296, 0.815661, 0.602217, 0.930006, 0.274428, 0.114345, 0.008692, 0]
        };
        var polyfills = reduce(['Promise', 'String.prototype.trim', 'Object.create'], ['MyChrome 11']);
        delete autoprefixer.data.browsers.mychrome;

        expect(polyfills).to.eql([]);
    });


    describe('.list', function () {

        it('returns list of all required polyfills', function () {
            expect(reduce.list()).to.be.instanceof(Array);
        });

    });

    describe('.support', function () {

        it('uses custom supports', function () {
            reduce.support({
                "Chrome": [{
                    "only": "29",
                    "fill": "PewpewOlolo"
                }]
            });
            var polyfills = reduce(['PewpewOlolo'], ['Chrome 30']);
            expect(polyfills).to.eql([]);
        });

        it('can define new browsers', function () {
            reduce.support({
                "ChromePewpew": [{
                    "only": "29",
                    "fill": "PewpewOlolo"
                }]
            });
        });

    });

});
