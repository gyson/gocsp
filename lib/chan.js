'use strict';

var assert = require('assert')

//
// TODO: need channel locker for read-only / write-only ?
//

module.exports = function chan(n) {
    if (arguments.length >= 1 && (n !== ~~n || n < 0)) {
        throw new Error(n + ' must be non-negative integer')
    }
    return new Channel(n || 0)
}

function TakeOperation(next, prev, cb) {
    this._takeNext = next
    this._takePrev = prev
    this._takeCallback = cb
}

function removeTake(op) {
    if (op._takeNext) {
        op._takeNext._takePrev = op._takePrev
    }
    if (op._takePrev) {
        op._takePrev._takeNext = op._takeNext
    }
    op._takeNext = null
    op._takePrev = null
    return op
}

function PutOperation(next, prev, cb, value) {
    this._putNext = next
    this._putPrev = prev
    this._putCallback = cb
    this._putValue = value
}

function removePut(op) {
    if (op._putNext) {
        op._putNext._putPrev = op._putPrev
    }
    if (op._putPrev) {
        op._putPrev._putNext = op._putNext
    }
    op._putNext = null
    op._putNext = null
    return op
}

function Channel(n) {
    this._limit = n
    this._size = 0

    this._closed = false
    this._value = undefined

    this._takeNext = this
    this._takePrev = this

    this._putNext = this
    this._putPrev = this

    // the next pending put operation
    this._putWait = null
}

// return a callback
Channel.prototype._take = function (cb) {
    // has put operation
    if (this !== this._putNext) {
        var op = removePut(this._putNext)
        var f = op.putCallback
        if (f) {
            f(true)
        }
        // if any wait
        if (this._putWait) {
            var f = this._putWait._putCallback
            this._putWait._putCallback = null

            f(true)

            if (this._putWait._putNext !== this) {
                this._putWait = this._putWait._putNext
            } else {
                this._putWait = null
            }
        } else {
            this._size -= 1
        }
        cb({ done: false, value: op._putValue })
        return
    }

    if (this._closed) {
        cb({ done: true, value: this._value })
        return
    }

    // pending take operation
    var takeOp = new TakeOperation(this, this._takePrev, cb)
    this._takePrev._takeNext = takeOp
    this._takePrev = takeOp

    return takeOp
}

Channel.prototype._put = function (val, cb) {
    if (this._closed) {
        cb(false)
        return
    }

    var takeOp = this._takeNext
    // some pending take operation
    if (this !== takeOp) {
        removeTake(takeOp)

        var f = takeOp._takeCallback
        f({ done: false, value: val })

        cb(true)
        return
    }

    if (this._size < this._limit) {
        this._size += 1
        // assert this.
        var putOp = new PutOperation(this, this._putPrev, null, val)
        this._putPrev._putNext = putOp
        this._putPrev = putOp
        cb(true)
        return

    }

    // append to end
    var putOp = new PutOperation(this, this._putPrev, cb, val)
    this._putPrev._putNext = putOp
    this._putPrev = putOp

    if (!this._putWait) {
        this._putWait = putOp
    }

    return putOp
}

Channel.prototype._close = function (val) {
    if (this._closed) {
        return
    }
    this._closed = true
    this._value = val

    if (this._size <= 0) {
        // free all take operation
        while (this._takeNext !== this) {
            var f = removeTake(this._takeNext)._takeCallback
            if (f) {
                f({ done: true, value: val })
            }
        }
    } else {
        // free all unqueued put operation
        if (this._putWait) {
            var op = this._putWait._putPrev
            while (op._putNext !== this) {
                var f = removePut(op._putNext)._putCallback
                if (f) {
                    f(false)
                }
            }
        }
    }
}

Channel.prototype._cancel = function (ref) {
    if (ref) {
        if (ref._takeCallback) {
            // take operation
            removeTake(ref)
            ref._takeCallback = null

        } else if (ref._putCallback) {
            // put operation
            removePut(ref)
            ref._putCallback = null
        }
    }
}

// channel is closed, queue may not empty
// Channel.prototype._waitClose = function (cb) {}

// channel is closed and queue is empty
// Channel.prototype._waitClear = function (cb) {}
