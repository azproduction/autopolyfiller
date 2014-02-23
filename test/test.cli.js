/*global describe, it, beforeEach, afterEach*/
/*jshint expr:true*/

var join = require('path').join,
    format = require('util').format,
    fs = require('fs'),
    stream = require('mock-utf8-stream'),
    cliJs = join(__dirname, '..', (process.env.AUTOPOLIFILLER_COVERAGE ? 'lib-cov' : 'lib'), 'cli.js'),
    cliBin = join(__dirname, '..', 'bin', 'autopolyfiller'),
    AutoPolyFillerCli = require(cliJs),
    expect = require('chai').expect;

var TEMPORARY_FILE = join(__dirname, 'fixtures/cli/tmp/pf.js');

describe('cli', function () {
    var stdout,
        stdin,
        stderr,
        exit = process.exit;

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
        stdout.captureData();

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
        stdout.captureData();
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
        done();
    });

    it('exit process with code 1 if content of STDIN is bad', function (done) {
        done();
    });

    describe('<glob|file ...>', function () {

        it('can be list of files', function (done) {
            stdout.captureData();

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
            stdout.captureData();

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
            stdout.captureData();

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
            stdout.captureData();

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
            stdout.captureData();

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
            stdout.captureData();

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
            stderr.captureData();

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

    describe('-b, --browsers', function  () {

        it('reduces polyfills against required browsers', function (done) {
            done();
        });

        it('can be comma separated list of browsers', function (done) {
            done();
        });

    });

});
