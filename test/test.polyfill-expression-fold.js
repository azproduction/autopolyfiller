/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var fold = require('../' + (process.env.AUTOPOLIFILLER_COVERAGE ? 'lib-cov' : 'lib') + '/polyfill-expression-fold'),
    expect = require('chai').expect;

describe('polyfill-expression-fold', function() {

    it('returns empty chain if ast is empty', function () {
        expect(fold()).to.eql([]);
    });

    it('folds Identifiers', function () {
        var ast = {
            type: 'Identifier',
            name: 'a'
        };

        expect(fold(ast)).to.eql(['a']);
    });

    it('ignores non Identifiers nor MemberExpressions', function () {
        var ast = {
            type: 'Literal',
            value: '1'
        };

        expect(fold(ast)).to.eql([]);
    });

    it('folds MemberExpressions with Identifier', function () {
        var ast = {
            type: 'MemberExpression',
            property: {
                type: 'Identifier',
                name: 'a'
            }
        };

        expect(fold(ast)).to.eql(['a']);
    });

    it('folds MemberExpressions with Literal', function () {
        var ast = {
            type: 'MemberExpression',
            property: {
                type: 'Literal',
                value: '1'
            }
        };

        expect(fold(ast)).to.eql(['1']);
    });

    it('ignores bad ast', function () {
        var ast = {
            type: 'MemberExpression',
            property: {
                type: 'CallExpression',
                callee: {
                    type: 'Identifier',
                    name: 'log'
                },
                arguments: []
            }
        };

        expect(fold(ast)).to.eql([]);
    });

    it('folds deep MemberExpressions', function () {
        var ast = {
            type: 'MemberExpression',
            property: {
                type: 'Identifier',
                name: 'c'
            },
            object: {
                type: 'MemberExpression',
                property: {
                    type: 'Identifier',
                    name: 'b'
                },
                object: {
                    type: 'Identifier',
                    name: 'a'
                }
            }
        };

        expect(fold(ast)).to.eql(['a', 'b', 'c']);
    });

});
