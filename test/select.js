'use strict';

var test = require('tape')
var wrap = require('bluebird').coroutine
var csp = require('..')

test('select chan', wrap(function* (t) {

    var ch1 = csp.chan()
    var ch2 = csp.chan()

    setTimeout(function () {
        csp.put(ch1, 123)
    }, 50)

    setTimeout(function () {
        csp.put(ch2, 456)
    }, 100)

    var arr = []

    for (var i = 0; i < 2; i++) {
        yield csp.select(function (s) {
            s.take(ch1, function (x) {
                t.equal(x.done, false)
                arr.push(x.value)
            })
            ||
            s.take(ch2, function (x) {
                t.equal(x.done, false)
                arr.push(x.value)
            })
        })
    }

    t.deepEqual(arr, [123, 456])

    t.end()
}))

test('select channel', function (t) {
    t.plan(2)

    var chan1 = csp.chan()
    var chan2 = csp.chan()

    wrap(function* () {
        yield csp.select(function (s) {
            s.take(chan1)
            ||
            s.take(chan2, function (x) {
                t.equal(x.value, 2)
            })
        })
    })()
    csp.put(chan2, 2)

    wrap(function* () {
        yield csp.select(function (s) {
            s.take(chan1, function (x) {
                t.equal(x.value, 1)
            })
            ||
            s.take(chan2)
        })
    })()
    csp.put(chan1, 1)
})


test('nested-select', wrap(function* (t) {
    t.plan(4)

    var ch = csp.chan()

    csp.put(ch, 1)
    csp.put(ch, 2)
    csp.put(ch, 3)
    csp.put(ch, 4)

    yield csp.select(function (s) {
        s.take(ch, wrap(function* (res) {

            t.equal(res.value, 1)

            yield csp.select(function (s) {
                s.take(ch, wrap(function* (res) {

                    t.equal(res.value, 2)

                    yield csp.select(function (s) {
                        s.take(ch, wrap(function* (res) {

                            t.equal(res.value, 3)

                            yield csp.select(function (s) {
                                s.take(ch, wrap(function* (res) {

                                    t.equal(res.value, 4)

                                }))
                            })
                        }))
                    })
                }))
            })
        }))
    })

    t.end()
}))

test('select timeout', wrap(function* (t) {
    // t.plan(1)
    var bool = true

    setTimeout(function () {
        bool = false
    }, 150)

    yield csp.select(function (s) {
        s.timeout(100, function () {
            t.equal(bool, true)
        })
    })

    t.end()
}))

test('select default', wrap(function* (t) {

    t.end()
}))

test('select short cut', wrap(function* (t) {

    var ch1 = csp.chan()
    var ch2 = csp.chan()

    csp.put(ch1, 'hello')

    yield csp.select(function (s) {
        s.take(ch1, function (res) {
            t.equal(res.value, 'hello')
        })
        ||
        s.take(t.fail('should not call this'))
    })
    t.end()
}))

test('select multiple', wrap(function* (t) {
    // ...
    // ...

    t.end()
}))
