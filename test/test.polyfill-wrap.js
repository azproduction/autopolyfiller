/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var wrap = require('../' + (process.env.AUTOPOLIFILLER_COVERAGE ? 'lib-cov' : 'lib') + '/polyfill-wrap'),
    expect = require('chai').expect;

describe('polyfill-wrap', function() {

    it('wraps code with expression', function () {
        var code = 'Array.prototype.every = function () {};',
            condition = '!Array.prototype.every';

        var wrappedCode = wrap(code, condition);

        expect(wrappedCode).to.match(/Array\.prototype\.every\s=\sfunction\s\(\)\s\{\};/);
        expect(wrappedCode).to.match(/!Array\.prototype\.every/);
    });

});
