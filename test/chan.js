'use strict';

var test = require('tape')
var wrap = require('bluebird').coroutine
var csp = require('..')

test('chan', wrap(function* (t) {

    var ch = csp.chan(2)

    csp.put(ch, 123)
    csp.put(ch, 456)

    csp.close(ch, 'done')

    var res0 = yield csp.take(ch)
    t.equal(res0.done, false)
    t.equal(res0.value, 123)

    var res1 = yield csp.take(ch)
    t.equal(res1.done, false)
    t.equal(res1.value, 456)

    var res2 = yield csp.take(ch)
    t.equal(res2.done, true)
    t.equal(res2.value, 'done')

    t.end()
}))

test('chan close', wrap(function* (t) {

    var ch = csp.chan(1)

    var put1 = csp.put(ch, 1)
    var put2 = csp.put(ch, 2)
    var put3 = csp.put(ch, 3)

    csp.close(ch)

    t.equal(yield put1, true)
    t.equal(yield put2, false)
    t.equal(yield put3, false)

    t.equal((yield csp.take(ch)).value, 1)
    t.equal((yield csp.take(ch)).done, true)

    t.end()
}))
