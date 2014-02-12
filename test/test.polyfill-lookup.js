/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var Lookup = require('..'),
    expect = require('chai').expect;

describe('autopolyfiller', function() {

    it('finds prototype-based polyfills', function () {
        var matches = new Lookup('"".trim();').find();
        expect(matches).to.eql(['String.prototype.trim']);
    });

    it('finds static method polyfills', function () {
        var matches = new Lookup('Object.create();').find();
        expect(matches).to.eql(['Object.create']);
    });

    it('finds constructor polyfills', function () {
        var matches = new Lookup('new Promise();').find();
        expect(matches).to.eql(['Promise']);
    });

});
