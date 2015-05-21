'use strict';

var assert = require('assert')
// var LinkList = require('link-list')

// support lock or read-only / write-only channel ?

module.exports = function chan(size) {
    return new Channel(size)
}

function TakeOperation(next, prev, cb) {
    this._takeNext = next
    this._takePrev = prev
    this._takeCallback = cb
}

function PutOperation(next, prev, cb, value) {
    this._putNext = next
    this._putPrev = prev
    this._putCallback = cb
    this._putValue = value
}

function Channel(n) {
    if (arguments.length >= 1 && (n !== ~~n || n < 0)) {
        throw new Error(n + ' must be non-negative integer')
    }
    this._capacity = n || 0
    this._size = 0

    this._closed = false
    this._value = undefined

    // this._queueOperation = null
    this._takeNext = this
    this._takePrev = this

    this._putNext = this
    this._putPrev = this
    // this._takeOps = new LinkList() // for take cb or queue value
    // this._queue = new LinkList() // store these items ?
    // this._putOps = new LinkList() //
}

var NOOP_TAKE = new TakeOperation(null, null, null)

Channel.prototype._take = function (cb) {
    //
    // if it's size > 0
    //

    if (this._closed) {
        cb({ done: true, value: this._value })
        return NOOP_TAKE // new TakeOperation(null, null, null)
    }

    if (!this._putOps.isEmpty()) {
        var putOp = this._putOps.shift()
        putOp.cb(true) // call it with undefined ?
        cb({ done: false, value: putOp.value })
        return NOOP_TAKE
    }
    // else {
        return this._takeOps.push(cb)
    // }
}

var NOOP_PUT = new PutOperation(null, null, null, null)

Channel.prototype._put = function (val, cb) {
    if (this._closed) {
        cb(false)
        return NOOP_PUT
    }
    if (!this._takeOps.isEmpty()) {
        var takeOp = this._takeOps.shift()
        takeOp({ done: false, value: val })
        cb(true)
        return NOOP_PUT
    }

    if (this._size < this._limit) {
        this._size += 1

        // ...
    } else {
        // append to end
        var putOp = new PutOperation(this, this._putPrev, cb, val)
        this._putPrev._putNext = putOp
        this._putPrev = putOp
        return putOp
    }
}

Channel.prototype._close = function (val) {
    if (this._closed) {
        return
    }
    this._closed = true
    this._value = val

    if (this._size <= 0) {
        // free all take operation
    } else {
        // free all unqueued put operation
    }

    // if any takers
    // this._takeOps.shiftEach(function (cb) {
    //     cb({ done: true, value: val })
    // })
    // if any putops
    // this._putOps.shiftEach(function (put) {
    //     put.cb(false)
    // })
    // queue
    // clear some of them that has to much
}

Channel.prototype._cancel = function (ref) {
    if (ref) {

    }
}

// channel is closed, queue may not empty
// Channel.prototype._waitClose = function (cb) {}

// channel is closed and queue is empty
// Channel.prototype._waitClear = function (cb) {}
