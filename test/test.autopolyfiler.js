/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var autopolyfiller = require('..'),
    astQuery = require('grasp-equery').query,
    expect = require('chai').expect;

var reLocalPolyfills = /^__/;

describe('autopolyfiller', function () {

    it('accepts browsers as ...rest parameter', function () {
        var polyfills = autopolyfiller('IE 11', 'Chrome >= 31').add('"".trim();').polyfills;

        expect(polyfills).to.eql([]);
    });

    it('accepts browsers as array parameter', function () {
        var polyfills = autopolyfiller(['IE 11', 'Chrome >= 31']).add('"".trim();').polyfills;

        expect(polyfills).to.eql([]);
    });

    describe('.add', function () {

        it('stores unique polyfills', function () {
            var polyfills = autopolyfiller('IE 7').add('"".trim();').add('"".trim();').polyfills;

            expect(polyfills).to.eql(['String.prototype.trim']);
        });

        it('keeps all polyfills if no browsers passed', function () {
            var polyfills = autopolyfiller().add('"".trim();').add('Object.keys();').polyfills;

            expect(polyfills).to.eql(['String.prototype.trim', 'Object.keys']);
        });

        it('scans polyfills for extra polyfills', function () {
            var polyfills = autopolyfiller().add('Object.defineProperties();').polyfills;

            expect(polyfills).to.eql(['Object.defineProperties', 'Object.defineProperty']);
        });

        it('scans polyfills for extra polyfills recursively', function () {
            autopolyfiller.use({
                test: function (ast) {
                    return astQuery('__.recursively(_$)', ast).length ? ['PewPew.prototype.recursively'] : [];
                },
                support: {
                    'Opera': [{
                        'only': '11.5',
                        'fill': 'PewPew.prototype.recursively'
                    }]
                },
                polyfill: {
                    'PewPew.prototype.recursively': 'Object.defineProperties(' +
                        'PewPew.prototype, {' +
                            'myTemporary: function(){}' +
                        '}' +
                    ');'
                }
            });
            var polyfills = autopolyfiller('Opera 11.5').add('"".recursively();').polyfills;

            expect(polyfills).to.eql(['PewPew.prototype.recursively', 'Object.defineProperties', 'Object.defineProperty']);
        });
    });

    describe('.use', function () {

        it('registers matchers, support, wrappers and polyfills', function () {
            autopolyfiller.use({
                test: function (ast) {
                    return astQuery('__.ololo(_$)', ast).length ? ['PewPew.prototype.ololo'] : [];
                },
                support: {
                    'Chrome': [{
                        'only': '19',
                        'fill': 'PewPew.prototype.ololo'
                    }]
                },
                polyfill: {
                    'PewPew.prototype.ololo': 'PewPew.prototype.ololo = {};'
                },
                wrapper: {
                    'PewPew.prototype.ololo': {
                        'before': 'if (!PewPew.prototype.ololo) {',
                        'after': '}'
                    }
                }
            });

            var polyfills = autopolyfiller('Chrome 19').add('"".ololo();').polyfills;

            expect(polyfills).to.eql(['PewPew.prototype.ololo']);
        });

        it('ignores absent parameters', function () {
            autopolyfiller.use({});
        });

    });

    describe('.toString', function () {

        it('returnes polyfills code as string', function () {
            var code = 'PewPew.prototype.test = {};';

            autopolyfiller.use({
                test: function (ast) {
                    return astQuery('__.test(_$)', ast).length ? ['PewPew.prototype.test'] : [];
                },
                support: {
                    'Chrome': [{
                        'only': '19',
                        'fill': 'PewPew.prototype.test'
                    }]
                },
                polyfill: {
                    'PewPew.prototype.test': code
                }
            });

            var polyfillsCode = autopolyfiller('Chrome 19').add('"".test();').toString();

            expect(polyfillsCode).to.have.string(code);
        });

        it('wraps code with conditional expression', function () {
            var polyfills = autopolyfiller('IE 7').add('"".trim();').toString();

            expect(polyfills).to.match(/String\.prototype\.trim/);
            expect(polyfills).to.match(/!String\.prototype\.trim/);
        });

    });

    describe('.include', function () {

        it('includes extra polyfills', function () {
            var polyfills = autopolyfiller()
                .include(['Promise'])
                .add('"".trim();')
                .polyfills;

            expect(polyfills).to.eql(['Promise', 'String.prototype.trim']);
        });

        it('filters against list of excluded polyfills', function () {
            var polyfills = autopolyfiller()
                .exclude(['Promise'])
                .include(['Promise'])
                .add('"".trim();')
                .exclude(['String.prototype.trim'])
                .polyfills;

            expect(polyfills).to.eql([]);
        });

        it('adds unique polyfills', function () {
            var polyfills = autopolyfiller()
                .include(['String.prototype.trim', 'String.prototype.trim'])
                .add('"".trim();')
                .polyfills;

            expect(polyfills).to.eql(['String.prototype.trim']);
        });

        it('accepts wildcards', function () {
            var polyfills = autopolyfiller()
                .include(['Array.*'])
                .polyfills;

            expect(polyfills.length).to.be.above(0);
        });

    });

    describe('.exclude', function () {

        it('adds exclued polyfills to the `excluedPolyfills` list', function () {
            var excluedPolyfills = autopolyfiller()
                .exclude(['Promise'])
                .add('"".trim();')
                .excluedPolyfills;

            expect(excluedPolyfills).to.eql(['Promise']);
        });

        it('removes non required polyfills', function () {
            var polyfills = autopolyfiller()
                .exclude(['Promise'])
                .include(['Promise', 'Object.keys'])
                .exclude(['Object.keys', 'Array.prototype.map'])
                .add('"".trim();[].map(function () {});')
                .exclude(['String.prototype.trim'])
                .polyfills;

            expect(polyfills).to.eql([]);
        });

    });

    describe('.withParser', function () {
        it('overriders default parser and parser options', function () {
            var myParser = {
                parse: function () {

                }
            };

            var myParserOptions = {};

            var instance = autopolyfiller()
                .withParser(myParser, myParserOptions);

            expect(instance.parser).to.eql(myParser);
            expect(instance.parserOptions).to.eql(myParserOptions);
        });

        it('throws in case of invalid parser', function () {
            expect(function () {
                autopolyfiller().withParser({});
            }).to.throw(Error);
        });
    });

});
