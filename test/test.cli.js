/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true, maxstatements:50*/

var join = require('path').join;
var fs = require('fs');
var stream = require('mock-utf8-stream');
var cliJs = join(__dirname, '..', 'lib', 'cli.js');
var cliBin = join(__dirname, '..', 'bin', 'autopolyfiller');
var AutoPolyFillerCli = require(cliJs);
var expect = require('chai').expect;

var TEMPORARY_FILE = join(__dirname, 'fixtures/cli/tmp/pf.js');

describe('cli', function () {
    var stdout;
    var stdin;
    var stderr;
    var exit;

    beforeEach(function () {
        stdout = new stream.MockWritableStream();
        stdout.write = function (data, encoding, cb) {
            this.emit('data', data);
            cb && cb();
        };
        stderr = new stream.MockWritableStream();
        stderr.write = function (data, encoding, cb) {
            this.emit('data', data);
            cb && cb();
        };
        stdin = new stream.MockReadableStream();
        stdin.isTTY = true;
        exit = function (status) {
            exit.status = status;
        };
    });

    afterEach(function () {
        if (fs.existsSync(TEMPORARY_FILE)) {
            fs.unlinkSync(TEMPORARY_FILE);
        }
    });

    it('ignores missing callback', function () {
        new AutoPolyFillerCli({
            stdin: stdin,
            stdout: stdout,
            stderr: stderr,
            exit: exit,
            argv: [
                'node',
                cliBin
            ]
        });
    });

    it('prints help if no files were passed', function (done) {
        stdout.startCapture();

        new AutoPolyFillerCli({
            stdin: stdin,
            stdout: stdout,
            stderr: stderr,
            exit: exit,
            argv: [
                'node',
                cliBin
            ]
        }, function () {
            expect(stdout.capturedData).to.match(/Options/);
            expect(stdout.capturedData).to.match(/Usage/);
            expect(stdout.capturedData).to.match(/Examples/);
            done();
        });
    });

    it('accepts STDIN', function (done) {
        stdout.startCapture();
        stdin.isTTY = false;

        new AutoPolyFillerCli({
            stdin: stdin,
            stdout: stdout,
            stderr: stderr,
            exit: exit,
            argv: [
                'node',
                cliBin
            ]
        }, function () {
            expect(stdout.capturedData).to.match(/String.prototype.trim/);
            done();
        });

        setTimeout(function () {
            stdin.emit('data', fs.readFileSync(__dirname + '/fixtures/cli/a.js'));
            stdin.emit('end');
        }, 0);
    });

    it('exit process with code 1 if content of input file is bad', function (done) {
        stderr.startCapture();

        new AutoPolyFillerCli({
            stdin: stdin,
            stdout: stdout,
            stderr: stderr,
            exit: exit,
            argv: [
                'node',
                cliBin,
                'test/fixtures/cli/c.coffee'
            ]
        }, function (error) {
            setTimeout(function () {
                expect(stderr.capturedData).to.match(/Error while adding file from/);
                expect(exit.status).to.eql(1);
                expect(error).to.be.instanceof(Error);
                done();
            }, 0);
        });
    });

    it('exit process with code 1 if content of STDIN is bad', function (done) {
        stderr.startCapture();
        stdin.isTTY = false;

        new AutoPolyFillerCli({
            stdin: stdin,
            stdout: stdout,
            stderr: stderr,
            exit: exit,
            argv: [
                'node',
                cliBin
            ]
        }, function (error) {
            setTimeout(function () {
                expect(stderr.capturedData).to.match(/Error while adding file from STDIN/);
                expect(exit.status).to.eql(1);
                expect(error).to.be.instanceof(Error);
                done();
            }, 0);
        });

        setTimeout(function () {
            stdin.emit('data', 'var var throw;');
            stdin.emit('end');
        }, 0);
    });

    describe('<glob|file ...>', function () {

        it('can be list of files', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    'test/fixtures/cli/a.js',
                    'test/fixtures/cli/deep/b.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.match(/String.prototype.trim/);
                expect(stdout.capturedData).to.match(/Object.keys/);
                done();
            });
        });

        it('can be glob(s)', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    'test/fixtures/cli/**/*.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.match(/String.prototype.trim/);
                expect(stdout.capturedData).to.match(/Object.keys/);
                done();
            });
        });

        it('can be negative glob(s)', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    'test/fixtures/cli/**/*.js',
                    '!test/fixtures/cli/deep/*.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.match(/String.prototype.trim/);
                expect(stdout.capturedData).to.not.match(/Object.keys/);
                done();
            });
        });

    });

    describe('-v, --verbose', function () {

        it('prints verbose process log to stdout', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    '-v',
                    '-b',
                    'Explorer 7',
                    'test/fixtures/cli/a.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.match(/Generating polyfills for/);
                expect(stdout.capturedData).to.match(/Globbing files/);
                expect(stdout.capturedData).to.match(/Got 1 file/);
                expect(stdout.capturedData).to.match(/Got 1 polyfills for/);
                expect(stdout.capturedData).to.match(/Writing 1 polyfills to STDOUT/);
                done();
            });
        });

        it('silent if not passed', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    'test/fixtures/cli/empty.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.be.empty;
                done();
            });
        });

    });

    describe('-o, --output <file>', function () {

        it('prints polyfills to STDOUT by default', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    'test/fixtures/cli/a.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.match(/String.prototype.trim/);
                done();
            });
        });

        it('prints polyfills to STDERR if passed', function (done) {
            stderr.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    '-o',
                    'STDERR',
                    'test/fixtures/cli/a.js'
                ]
            }, function () {
                expect(stderr.capturedData).to.match(/String.prototype.trim/);
                done();
            });
        });

        it('prints polyfills to file if file passed', function (done) {

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    '-o',
                    TEMPORARY_FILE,
                    'test/fixtures/cli/a.js'
                ]
            }, function () {
                expect(fs.readFileSync(TEMPORARY_FILE, 'utf8')).to.match(/String.prototype.trim/);
                done();
            });
        });

    });

    describe('-b, --browsers', function () {

        it('reduces polyfills against required browsers', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    '-b',
                    'Chrome 30',
                    'test/fixtures/cli/**/*.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.be.empty;
                done();
            });
        });

        it('can be comma separated list of browsers', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    '-b',
                    'Explorer 8, Opera 12',
                    'test/fixtures/cli/**/*.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.match(/String.prototype.trim/);
                expect(stdout.capturedData).to.match(/Object.keys/);
                done();
            });
        });

    });

    describe('-x, --exclude <names>', function () {

        it('ignores listed polyfills', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    '-x',
                    'String.prototype.trim',
                    'test/fixtures/cli/**/*.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.match(/Object.keys/);
                done();
            });
        });

        it('can be comma separated list of polyfills', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    '-x',
                    'String.prototype.trim, Object.keys',
                    'test/fixtures/cli/**/*.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.be.empty;
                done();
            });
        });

    });

    describe('-i, --include <polyfills>', function  () {

        it('adds extra polyfills', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    '-i',
                    'Promise',
                    'test/fixtures/cli/**/*.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.match(/Promise/);
                done();
            });
        });

        it('can be comma separated list of polyfills', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    '-i',
                    'Promise, Array.prototype.map',
                    'test/fixtures/cli/**/*.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.match(/Promise/);
                expect(stdout.capturedData).to.match(/Array\.prototype\.map/);
                done();
            });
        });

    });

    describe('-p, --parser <parser>', function  () {
        it('overrides existing parser', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    '-v',
                    '-p',
                    'acorn',
                    'test/fixtures/cli_parser/es5.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.match(/Array\.prototype\.map/);
                done();
            });
        });
    });

    describe('-P, --parser-options <parser-options>', function  () {
        it('overrides parser options', function (done) {
            stdout.startCapture();

            new AutoPolyFillerCli({
                stdin: stdin,
                stdout: stdout,
                stderr: stderr,
                exit: exit,
                argv: [
                    'node',
                    cliBin,
                    '-v',
                    '-P',
                    '{"ecmaVersion":6}',
                    'test/fixtures/cli_parser/es6.js'
                ]
            }, function () {
                expect(stdout.capturedData).to.match(/Array\.prototype\.map/);
                done();
            });
        });
    });
});
