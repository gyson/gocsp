
var fs = require('../lib/fs')
var go = require('../lib/index')
var Channel = require('../lib/channel')

// read and write
Channel.through(
    fs.openRead(__dirname + '/abc.txt'),
    fs.openWrite(__dirname + '/abc_copied.txt')
)
.done(function (result) {
    console.log('done!')
})

// watch files
// Channel
//     .through(fs.watch(__dirname + '/abc.txt'))
//     .each(console.log)
//     .done()
