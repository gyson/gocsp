'use strict';

var test = require('tape')
var EE = require('events')

var go = require('../go')
var listen = require('../listen')
var timeout = require('../timeout')

test('gocsp/listen', function (t) {
    t.plan(1)
    var e = new EE()

    go(function* () {
        yield timeout(100)
        e.emit('hi', 123)
    })

    go(function* () {
        t.equal(yield listen(e, 'hi'), 123)
    })
})
