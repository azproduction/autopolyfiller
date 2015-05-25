var Command = require('commander').Command;
var fs = require('fs');
var mkdirp = require('mkdirp').sync;
var format = require('util').format;
var path = require('path');
var globule = require('globule');
var autopolyfiller = require('..');

var noop = function () {};

/**
 * @param {Object}   process
 * @param {Stream}   process.stdin
 * @param {Stream}   process.stdout
 * @param {Stream}   process.stderr
 * @param {Array}    process.argv
 * @param {Function} process.exit
 * @param {Object}   [process.env]
 * @param {Function} [done]
 */
function AutoPolyFillerCli(process, done) {
    this.process = process;
    this.program = this.createProgram();
    this.polyfiller = this.createPolyFiller();
    this.done = function (status) {
        (done || noop)(status);
        this.done = noop;
    }.bind(this);

    this.run(this.process.stdin.isTTY);
}

AutoPolyFillerCli.prototype = {
    _list: function (browsers) {
        return browsers.split(',').map(function (browser) {
            return browser.trim();
        });
    },

    log: function () {
        if (!this.program.verbose) {
            return;
        }

        this.process.stdout.write(format.apply(null, arguments) + '\n');
    },

    _logHelp: function (message) {
        this.process.stdout.write(message + '\n');
    },

    getOutput: function () {
        var output = this.program.output;
        switch (output) {
        case 'STDOUT':
            return this.process.stdout;
        case 'STDERR':
            return this.process.stderr;
        default:
            mkdirp(path.dirname(output));
            return fs.createWriteStream(output);
        }
    },

    createPolyFiller: function () {
        var browsers = this.program.browsers;
        var excludedPolyfills = this.program.exclude;
        var includedPolyfills = this.program.include;

        this.log((function () {
            if (!browsers.length) {
                return 'Generating polyfills for all browsers';
            }
            return 'Generating polyfills for' + [''].concat(browsers).join('\n  * ');
        })());

        if (includedPolyfills.length) {
            this.log('Adding extra polyfills: ' + [''].concat(includedPolyfills).join('\n  * '));
        }

        if (excludedPolyfills.length) {
            this.log('Ignoring polyfills: ' + [''].concat(excludedPolyfills).join('\n  * '));
        }

        return autopolyfiller(browsers)
            .withParser(this.program.parser, this.program.parserOptions)
            .exclude(excludedPolyfills)
            .include(includedPolyfills);
    },

    createProgram: function () {
        return new Command()
            .version(require('../package.json').version)
            .usage('[options] <glob|file ...>')
            .option('-o, --output <file>', 'set output file', 'STDOUT')
            .option('-b, --browsers <names>', 'generate polyfills for these browsers', this._list.bind(this), [])
            .option('-x, --exclude <polyfills>', 'exclude these polyfills', this._list.bind(this), [])
            .option('-i, --include <polyfills>', 'include these polyfills', this._list.bind(this), [])
            .option('-p, --parser <parser>', 'specifies JavaScript parser (node module)', require, null)
            .option(
                '-P, --parser-options <parser-options>',
                'custom parser options (valid json object)',
                JSON.parse.bind(JSON),
                void 0
            )
            .option('-v, --verbose', 'verbose output')
            .on('--help', function () {
                this._logHelp([
                    '  Examples:',
                    '',
                    '    $ echo "Object.keys({})" | autopolyfiller',
                    '    $ autopolyfiller -o polyfills.js script.js',
                    '    $ autopolyfiller -o polyfills.js -i Promise -x Array.prototype.map script.js',
                    '    $ autopolyfiller -b "last 1 version, > 1%, Explorer 7" lib/*.js vendors/**/*.js',
                    '    $ autopolyfiller lib/*.js !lib/lodash.js',
                    '    $ autopolyfiller -p acorn -P \'{"ecmaVersion":6}\' lib/*.js',
                    ''
                ].join('\n'));
            }.bind(this))
            .parse(this.process.argv);
    },

    addFile: function (fileContents, filePath) {
        try {
            this.polyfiller.add(fileContents);
        } catch (e) {
            this.process.stderr.write(format('Error while adding file from %s: %s', filePath, e) + '\n');
            this.done(new Error(String(e)));
            this.process.exit(1);
        }
    },

    addPatterns: function (patterns) {
        this.log('Globbing files %s', [''].concat(patterns).join('\n  * '));
        var files = globule.find(patterns);

        this.log('Got %d file(s)', files.length);
        files.forEach(function (file) {
            this.log('Reading file %s', file);
            this.addFile(fs.readFileSync(file, 'utf8'), file);
        }.bind(this));
    },

    readStdin: function (cb) {
        var buff = '';
        this.process.stdin.resume();
        this.process.stdin.setEncoding('utf8');
        this.process.stdin.on('data', function (data) {
            buff += data;
        });
        this.process.stdin.on('end', function () {
            cb(null, buff);
        });
    },

    writePolyFills: function () {
        var output = this.program.output;
        var polyfills = this.polyfiller.polyfills;

        this.log((function () {
            if (!polyfills.length) {
                return 'Polyfills are not required';
            }
            return 'Got ' + polyfills.length + ' polyfills for' +
                [''].concat(polyfills).join('\n  * ');
        })());

        this.log('Writing %d polyfills to %s', polyfills.length, output);
        this.getOutput().write(this.polyfiller.toString(), 'utf8', this.done.bind(this));
    },

    run: function (isTTY) {
        if (isTTY) {
            if (!this.program.args.length) {
                this._logHelp(this.program.helpInformation());
                this.program.emit('--help');
                this.done(null);
            } else {
                this.addPatterns(this.program.args);
                this.writePolyFills();
            }
        } else {
            this.readStdin(function (error, fileContents) {
                this.addFile(fileContents, 'STDIN');
                this.writePolyFills();
            }.bind(this));
        }
    }
};

module.exports = AutoPolyFillerCli;
