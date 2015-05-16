'use strict';

var test = require('tape')
var go = require('../go')
var thunk = require('../thunk')
var select = require('../select')
var Channel = require('../channel')
var timeout = require('../timeout')

test('select array', function (t) {

    var arr = []

    arr.push(thunk(function (cb) {
        setTimeout(function () {
            cb(null, 1)
        }, 10)
    }))

    arr.push(thunk(function (cb) {
        setTimeout(function () {
            cb(null, 2)
        }, 20)
    }))

    arr.push(thunk(function (cb) {
        setTimeout(function () {
            cb(null, 3)
        }, 30)
    }))

    select(function (s) {
        for (var i = 0; i < arr.length; i++) {
            var res = s(arr[i], function (_, val) {
                t.equal(val, 1)
                t.end()
            })
            if (res) {
                return
            }
        }
    })
})

test('select channel', function (t) {
    t.plan(2)

    var chan1 = new Channel()
    var chan2 = new Channel()

    go(function* () {
        yield select(function (s) {
            s(chan1.take())
            ||
            s(chan2.take(), function (err, res) {
                t.equal(res.value, 2)
            })
        })
    })
    chan2.put(2)

    go(function* () {
        yield select(function (s) {
            s(chan1.take(), function (err, res) {
                t.equal(res.value, 1)
            })
            ||
            s(chan2.take())
        })
    })
    chan1.put(1)
})


test('nested-select', function (t) {
    t.plan(4)

    var chan = new Channel()

    chan.put(1)
    chan.put(2)
    chan.put(3)
    chan.put(4)

    go(function* () {
        yield select(function (s) {
            s(chan.take(), function* (_, res) {

                t.equal(res.value, 1)

                yield select(function (s) {
                    s(chan.take(), function* (_, res) {

                        t.equal(res.value, 2)

                        yield select(function (s) {
                            s(chan.take(), function* (_, res) {

                                t.equal(res.value, 3)

                                yield select(function (s) {
                                    s(chan.take(), function* (_, res) {

                                        t.equal(res.value, 4)

                                    })
                                })
                            })
                        })
                    })
                })
            })
        })
    })
})

test('select timeout', go.wrap(function* (t) {
    t.plan(1)
    yield select(function (s) {
        s(go(function* () {
            yield timeout(50)
            return 123
        }), function (_, val) {
            t.equal(val, 123)
        })
        ||
        s(timeout(100), function () {
            console.log('should not reach here')
        })
    })
}))
