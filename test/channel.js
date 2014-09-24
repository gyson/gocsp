
var go = require('../lib/index')
var Channel = require('../lib/channel')

var ch = new Channel()

ch.each(console.log).done(function () {
    console.log('done!')
})

ch.put('hello')
ch.put('world')
ch.put('I am Yunsong').then(function () {
    ch.input.close()
})

// BUG HERE!
// ch.input.close()
