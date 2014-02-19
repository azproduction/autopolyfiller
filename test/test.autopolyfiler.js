/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var autopolyfiller = require('..'),
    expect = require('chai').expect;

describe('autopolyfiller', function() {

    it('accepts browsers as ...rest parameter', function () {
        var polyfills = autopolyfiller('IE 11', 'Chrome >= 31').add('"".trim();').polyfills;

        expect(polyfills).to.eql([]);
    });

    it('accepts browsers as array parameter', function () {
        var polyfills = autopolyfiller(['IE 11', 'Chrome >= 31']).add('"".trim();').polyfills;

        expect(polyfills).to.eql([]);
    });

    it('stores unique polyfills', function () {
        var polyfills = autopolyfiller('IE 7').add('"".trim();').add('"".trim();').polyfills;

        expect(polyfills).to.eql(['String.prototype.trim']);
    });

    it('keeps all polyfills if no browsers passed', function () {
        var polyfills = autopolyfiller().add('"".trim();').add('Object.keys();').polyfills;

        expect(polyfills).to.eql(['String.prototype.trim', 'Object.keys']);
    });

    it('uses custom matchers and support', function () {
        autopolyfiller.use({
            test: function (ast) {
                return ['PewPew.prototype.ololo'];
            },
            support: {
                'PewPew.prototype.ololo': {
                    'chrome 20': true
                }
            }
        });

        var polyfills = autopolyfiller('Chrome 20').add('"".ololo();').polyfills;

        expect(polyfills).to.eql([]);
    });


});
