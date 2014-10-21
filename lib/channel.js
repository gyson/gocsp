
'use strict'

module.exports = Channel
// exports.Channel = Channel => ES 6

var assert = require('assert')
var Promise = require('./promise')
var LinkList = require('link-list')
var noop = require('./util').noop
var panic = require('./util').panic

function Channel () {
    this._done = false
    this._error = false
    this._value = void 0

    this._takers = new LinkList()
    this._senders = new LinkList()

    var self = this
    self._promise = new Promise(function (resolve, reject) {
        self._resolve = resolve
        self._reject = reject
    })
}

// obj === { value: ..., done: ..., error: ... }
// chan.done(function (obj) { ... })

/*
    takeEach(go.async(function* () {
        // do something async
    }))
*/
// accept function or gen fun
// return true will stop taking
// throw exception will throw exception to channel
// if function return a promise, need to wait it
Channel.prototype.takeEach = function (handler) {
    var self = this
    next()
    function take(val) {
        if (!val.done) {
            try {
                var result = handler(val.value)
                // result is a promise
                if (result && typeof result.then === 'function') {
                    result.then(next, raise)
                    return
                }

                // or it's co
                if (typeof result === 'function') {
                    // handle thunk
                    return
                }

                next(result)

            } catch (err) {
                raise(err)
            }
        }
    }
    function next(stop) {
        if (stop) { return }
        self.take(take)
    }
    function raise(err) {
        self.throw(err)
    }
    return self
}

/*
    cancel an action
*/
Channel.cancel =
Channel.prototype.cancel = function (cancelable) {
    if (cancelable) {
        LinkList.remove(cancalable)
    }
}

/*
    port.take()   => Promise
    port.take(cb) => cancalable
*/
Channel.prototype.take = function (cb) {
    if (!cb) {
        var self = this
        return new Promise(function (resolve) {
            self.take(resolve)
        })
    }
    if (this._done) {
        cb({ done: true,
             error: this._error,
             value: this._value })
        return
    }
    if (this._senders.isEmpty()) {
        return this._takers.push(cb)
    }
    var sender = this._senders.shift()
    tryCatch(sender.cb, true)
    cb({ done: false, value: sender.data })
}

/*
    // if any error within cb
    // crash program

    port.put(val)     => Promise
    port.put(val, cb) => cancelable

    var x = port.put(val, function () {

    })
    Channel.cancel(x)
    port.cancel(x) ?
*/
Channel.prototype.put = function (data, cb) {
    if (!cb) {
        var self = this
        return new Promise(function (resolve) {
            self.put(data, resolve)
        })
    }
    if (this._done) {
        cb(false)
        return
    }
    if (this._takers.isEmpty()) {
        return this._senders.push({
            cb: cb,
            data: data
        })
    }
    var taker = this._takers.shift()
    tryCatch(taker, { done: false, value: data })
    cb(true)
}

Channel.prototype.canTake = function () {
    return this._done || (!this._senders.isEmpty())
}

Channel.prototype.canPut = function () {
    return this._done || (!this._takers.isEmpty())
}

Channel.prototype.takeSync = function () {
    if (this.isDone()) {
        return {
            done: true,
            error: this._error,
            value: this._value
        }
    }
    if (this.canTake()) {
        var sender = this._senders.shift()
        tryCatch(sender.cb, true)
        return { done: false, value: sender.data }
    }
    throw new Error('Cannot take from this channel now')
}

Channel.prototype.putSync = function () {
    if (this.isDone()) {
        return false
    }
    if (this.canPut()) {
        var taker = this._takers.shift()
        tryCatch(taker, { done: false, value: data })
        return true
    }
    throw new Error('Cannot put value to this channel now')
}

Channel.prototype.then = function (onFulfilled, onRejected) {
    return this._promise.then(onFulfilled, onRejected)
}

Channel.prototype.catch = function (onRejected) {
    return this._promise.catch(onRejected)
}

// cleanup sender's data
Channel.prototype.close = function (value) {
    if (this._done) { return }
    this._done = true
    this._value = value
    this._resolve(value)
    this._takers.shiftEach(function (takers) {
        tryCatch(takers, {
            done: true,
            error: false,
            value: value
        })
    })
    this._senders.shiftEach(function (sender) {
        tryCatch(sender, false)
    })
}

Channel.prototype.throw = function (error) {
    if (this._done) { return }
    this._done = true
    this._error = true
    this._value = error
    this._reject(error)
    this._takers.shiftEach(function (taker) {
        tryCatch(taker, {
            done: true,
            error: true,
            value: error
        })
    })
    this._senders.shiftEach(function (sender) {
        tryCatch(sender, false)
    })
}

Channel.prototype.isDone = function () {
    return this._done
}

Channel.prototype.isError = function () {
    if (!this._done) {
        throw new Error('Cannot check error from open port!')
    }
    return this._error
}

Channel.prototype.getValue = function () {
    if (!this._done) {
        throw new Error('Cannot get value from open port!')
    }
    return this._value
}

function tryCatch(fn, data) {
    try {
        fn(data)
    } catch (err) {
        panic(err)
    }
}
