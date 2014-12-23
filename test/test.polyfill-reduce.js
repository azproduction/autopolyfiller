/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var reduce = require('../lib/polyfill-reduce'),
    browserslist = require('browserslist'),
    expect = require('chai').expect;

describe('polyfill-reduce', function () {

    it('excludes supported polyfills', function () {
        var polyfills = reduce(['Promise', 'String.prototype.trim', 'Object.create'], ['IE 11', 'Chrome 31']);
        expect(polyfills).to.eql(['Promise']);
    });

    it('ignores undefined browsers', function () {
        browserslist.data.mychrome = {
            name: 'mychrome',
            released: ['37', '38', '39'],
            versions: ['37', '38', '39', '40']
        };
        var polyfills = reduce(['Promise', 'String.prototype.trim', 'Object.create'], ['mychrome 39']);
        delete browserslist.data.mychrome;

        expect(polyfills).to.eql([]);
    });

    it('throws if browser or version is undefined', function () {
        expect(function () {
            reduce(['Promise', 'String.prototype.trim', 'Object.create'], ['mychrome 39']);
        }).to.throw();

        expect(function () {
            reduce(['Promise', 'String.prototype.trim', 'Object.create'], ['Opera 1']);
        }).to.throw();
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
                    "fill": "__PewpewOlolo"
                }]
            });
            var polyfills = reduce(['__PewpewOlolo'], ['Chrome 30']);
            expect(polyfills).to.eql([]);
        });

        it('can define new browsers', function () {
            reduce.support({
                "ChromePewpew": [{
                    "only": "29",
                    "fill": "__PewpewOlolo"
                }]
            });
        });

    });

});
