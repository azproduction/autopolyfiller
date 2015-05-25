var glob = require('glob').sync;
var read = require('fs').readFileSync;
var scan = require('../../lib/polyfill-scan');
var Benchmark = require('benchmark');

var sources = glob(__dirname + '/assets/*.js').map(function (name) {
    return read(name, 'utf8');
});

var suite = new Benchmark.Suite();

suite.add('scan', function () {
    for (var i = 0, c = sources.length; i < c; i++) {
        scan(sources[i]);
    }
})
.on('cycle', function (event) {
    console.log(String(event.target));
})
.on('complete', function () {
    console.log('Fastest is ' + this.filter('fastest').pluck('name'));
})
.run({
    async: true
});
