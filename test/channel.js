'use strict';

var test = require('tape')
var Channel = require('../channel')


var test = require('tape')
var Channel = require('..')
var go = require('gocsp-go')

test('channel', function (t) {
    t.plan(5)

    var chan = new Channel()

    chan.put(1)
    chan.put(2)
    chan.put(3)
    chan.put(4)
    chan.close()

    go(function* () {
        t.equal((yield chan.take()).value, 1)
        t.equal((yield chan.take()).value, 2)
        t.equal((yield chan.take()).value, 3)
        t.equal((yield chan.take()).value, 4)
        t.equal((yield chan.take()).done, true)
    })
})


var test = require('tape')
var transy = require('transy')
var Channel = require('..')
var go = require('gocsp-go')

test.skip('transy', function (t) {

    var chan = new Channel(10, ty.each(function (data) {
        if (data > 10) {
            throw new Error()
        }
        // decode
        // encode
        // sync transforming data!
        // the transformation it self should be sync

        // this is bad!
        // setTimeout(function () {
        //     next(okk) // probably panic
        // })
    }))

    // ty.encode()
    // ty.decode()

    // lazy evaluation, unbox it until I have to

    co.spawn(function* () {
        yield chan.put(1) // ok
        yield chan.put(10) // ok
        yield chan.put(11) // error
    })
})

test('transy.each', go.wrap(function* (t) {
    t.plan(3)

    var sum = 0

    var chan = new Channel(2, transy.each(function (num) {
        sum += num
    }))

    yield chan.put(1)
    yield chan.take()
    t.assert(sum === 1)

    yield chan.put(2)
    yield chan.take()
    t.assert(sum === 3)

    yield chan.put(3)
    yield chan.take()
    t.assert(sum === 6)
}))

test('transy.encode', go.wrap(function* (t) {
    t.plan(1)

}))

test('transy.decode', go.wrap(function* (t) {
    t.plan(1)

}))

//test('transy.')
