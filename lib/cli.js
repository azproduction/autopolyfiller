var program = require('commander'),
    fs = require('fs'),
    mkdirp = require('mkdirp').sync,
    path = require('path'),
    globule = require('globule');

function browsersList(browsers) {
    return browsers.split(',').map(function (browser) {
        return browser.trim();
    });
}

function log(browsers) {
    if (!program.verbose) {
        return;
    }
    console.log.apply(console, arguments);
}

function getStreamFor(output) {
    switch (output) {
    case 'STDOUT':
        return process.stdout;
    case 'STDERR':
        return process.stderr;
    default:
        mkdirp(path.dirname(output));
        return fs.createWriteStream(output);
    }
}

function getPolyfillsFor(browsers) {
    log((function () {
        if (!browsers.length) {
            return 'Generating polyfills for all browsers';
        }
        return 'Generating polyfills for' + [''].concat(browsers).join('\n  * ');
    })());

    return require('..')(browsers);
}

function addFileTo(fileContents, polyfills) {
    polyfills.add(fileContents);

    return polyfills;
}

function addPatternsTo(patterns, polyfills) {
    log('Globbing files %s', [''].concat(patterns).join('\n  * '));
    var files = globule.find(patterns);

    log('Got %d file(s)', files.length);
    files.forEach(function (file) {
        log('Reading file %s', file);
        try {
            addFileTo(fs.readFileSync(file, 'utf8'), polyfills);
        } catch (e) {
            console.error('Error while adding file %s: %s', file, e);
            process.exit(1);
        }
    });

    return polyfills;
}

function writePolyfillsTo(output, polyfills) {
    log((function () {
        if (!polyfills.polyfills.length) {
            return 'Polyfills are not required';
        }
        return 'Got ' + polyfills.polyfills.length + ' polyfills for' +
            [''].concat(polyfills.polyfills).join('\n  * ');
    })());

    log('Writing %d polyfills to %s', polyfills.polyfills.length, output);
    getStreamFor(output).write(polyfills.toString(), 'utf8');

    return polyfills;
}

function readStdin(cb) {
    var buff = '';
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', function(data) {
        buff += data;
    });
    process.stdin.on('end', function () {
        cb(null, buff);
    });
}

program
    .version(require('../package.json').version)
    .usage('[options] <glob|file ...>')
    .option('-o, --output <file>', 'set output file', 'STDOUT')
    .option('-b, --browsers <names>', 'generate polyfills for these browsers', browsersList, [])
    .option('-v, --verbose', 'verbose output')
    .on('--help', function(){
        console.log('  Examples:');
        console.log('');
        console.log('    $ echo "Object.keys({})" | autopolyfiller');
        console.log('    $ autopolyfiller -o polyfills.js script.js');
        console.log('    $ autopolyfiller -b "last 1 version, > 1%, Explorer 7" lib/*.js vendors/**/*.js');
        console.log('    $ autopolyfiller lib/*.js !lib/lodash.js');
        console.log('');
    })
    .parse(process.argv);

var patterns = program.args,
    output = program.output,
    browsers = program.browsers;

if (process.stdin.isTTY) {
    if (!patterns.length) {
        program.help();
    } else {
        writePolyfillsTo(output, addPatternsTo(patterns, getPolyfillsFor(browsers)));
    }
} else {
    readStdin(function (error, fileContents) {
        writePolyfillsTo(output, addFileTo(fileContents, getPolyfillsFor(browsers)));
    });
}
