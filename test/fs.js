
var fs = require('../lib/fs')
var go = require('../lib/index')
var Channel = require('../lib/channel')

// read and write
new Channel()
    .pipe(fs.openRead(__dirname + '/abc.txt'))
    .pipe(fs.openWrite(__dirname + '/abc_copied.txt'))
    .output.then(function (result) {
        console.log(result.value)
    })

// watch files
new Channel()
    .pipe(fs.watch(__dirname + '/abc.txt'))
    .each(console.log)
    .done()
