
var go = require('../lib/index')
var stream = require('stream')
var Readable = stream.Readable

var chan = go.Channel.chain(function () {this

    .map(function (x) { return x.toString() })
    .map(function (x) { return 'reply: ' + x })

})


process.stdin
    .pipe(chan)
    .pipe(process.stdout);
