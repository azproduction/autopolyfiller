/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var wrap = require('../lib/polyfill-wrap');
var expect = require('chai').expect;

describe('polyfill-wrap', function () {

    it('uses negative polyfill as expression if `polyfillName` is a prototype property', function () {
        var code = 'Array.prototype.every = function () {};';
        var polyfillName = 'Array.prototype.every';

        var wrappedCode = wrap(code, polyfillName);

        expect(wrappedCode).to.match(/Array\.prototype\.every = function \(\) \{\};/);
        expect(wrappedCode).to.match(/!Array\.prototype\.every/);
    });

    it('uses window.Object as expression if `polyfillName` is a Window prototype property', function () {
        var code = 'Window.prototype.JSON = {};';
        var polyfillName = 'Window.prototype.JSON';

        var wrappedCode = wrap(code, polyfillName);

        expect(wrappedCode).to.match(/Window\.prototype\.JSON = \{\};/);
        expect(wrappedCode).to.match(/typeof window\.JSON === "undefined"/);
    });

    it('uses typeof polyfill === "undefined" as expression if `polyfillName` is a single object', function () {
        var code = 'Promise = function () {};';
        var polyfillName = 'Promise';

        var wrappedCode = wrap(code, polyfillName);

        expect(wrappedCode).to.match(/Promise = function \(\) \{\};/);
        expect(wrappedCode).to.match(/typeof Promise === "undefined"/);
    });

    it('uses complex expression if `polyfillName` is a static method polyfill', function () {
        var code = 'Object.keys = function () {};';
        var polyfillName = 'Object.keys';

        var wrappedCode = wrap(code, polyfillName);

        expect(wrappedCode).to.match(/Object.keys = function \(\) \{\};/);
        expect(wrappedCode).to.match(/typeof Object !== "undefined" && !Object.keys/);
    });

    describe('.addWrapper', function () {
        it('declares special polyfill wrapper', function () {
            wrap.addWrapper({
                __PewpewOlolo: {
                    before: '',
                    after: ''
                }
            });

            var code = '__PewpewOlolo = function () {};';
            var polyfillName = '__PewpewOlolo';

            expect(wrap(code, polyfillName)).to.eql(code);
        });
    });

});
