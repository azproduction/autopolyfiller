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

    it('scans for static method polyfills', function () {
        var polyfills = scan('Object.create();');
        expect(polyfills).to.eql(['Object.create']);
    });

    it('scans for constructor polyfills', function () {
        var polyfills = scan('new Promise();');
        expect(polyfills).to.eql(['Promise']);
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
