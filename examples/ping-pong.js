'use strict';

var co = require('co')
var csp = require('..')

// from http://talks.golang.org/2013/advconc.slide#6

var player = co.wrap(function* (name, ch) {
    for (;;) {
        var ball = (yield csp.take(ch)).value
        ball += 1
        console.log(name, ball)
        yield csp.timeout(100)
        yield csp.put(ch, ball)
    }
})

co(function* () {
    var ch = csp.chan()

    player('ping', ch)
    player('pong', ch)

    yield csp.put(ch, 0)
    yield csp.timeout(1000)
    yield csp.take(ch)
})
