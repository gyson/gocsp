
var fs = require('../lib/fs')
var go = require('../lib/index')
var Channel = require('../lib/channel')

var ch = new Channel()
    .pipe(fs.openRead(__dirname + '/abc.txt'))
    .pipe(fs.openWrite(__dirname + '/abc_copied.txt'))
    .output._take(function (result) {
        console.log(result.value)
    })
