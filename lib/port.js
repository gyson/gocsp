
'use strict'

module.exports = Port

var assert = require('assert')
var run = require('./coroutine').run
var Promise = require('./promise')
var LinkList = require('./linklist')
var noop = require('./util').noop
var panic = require('./util').panic
var isGenFun = require('./util').isGenFun

function Port () {
    this._done = false
    this._error = false
    this._message = void 0

    this._takers = new LinkList()
    this._senders = new LinkList()

    var self = this
    self._promise = new Port.Promise(function (resolve, reject) {
        self._resolve = resolve
        self._reject = reject
    })
}

// accept function or gen fun
Port.prototype.each =
Port.prototype.forEach = function (handler) {
    assert(typeof handler === 'function')
    var self = this
    var isGen = isGenFun(handler)
    next()
    function take(val) {
        if (!val.done) {
            if (isGen) {
                run(handler(val.value), next, raise)
            } else {
                try {
                    handler(val.value)
                    next()
                } catch (err) {
                    raise(err)
                }
            }
        }
    }
    function next() {
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
Port.cancel = function (cancelable) {
    // ensure that it's not undefined
    if (cancelable) {
        LinkList.remove(cancelable)
    }
}

Port.Promise = Promise

/*
    port.take()   => Port.Promise
    port.take(cb) => cancalable
*/
Port.prototype.take = function (cb) {
    if (cb) {
        if (this._done) {
            cb({ done: true, value: this._message })
            return
        }
        if (this._senders.isEmpty()) {
            return this._takers.push(cb)
        }
        var sender = this._senders.shift()
        try {
            sender.cb(true)
        } catch (err) {
            panic(err)
        }
        cb({ done: false, value: sender.data })
    } else {
        var self = this
        return new Port.Promise(function (resolve) {
            self.take(resolve)
        })
    }
}

/*
    // if any error within cb
    // crash program

    port.put(val)     => Port.Promise
    port.put(val, cb) => cancelable

    var x = port.put(val, function () {

    })
    Port.cancel(x)
*/
Port.prototype.put = function (data, cb) {
    if (cb) {
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
        try {
            taker({ done: false, value: data })
        } catch (err) {
            panic(err)
        }
        cb(true)
    } else {
        var self = this
        return new Port.Promise(function (resolve) {
            self.put(data, resolve)
        })
    }
}

Port.prototype.then = function (onFulfilled, onRejected) {
    return this._promise.then(onFulfilled, onRejected)
}

Port.prototype.catch = function (onRejected) {
    return this._promise.catch(onRejected)
}

// cleanup sender's data
Port.prototype.close = function (message) {
    if (this._done) { return }
    this._done = true
    this._message = message

    this._resolve(message)

    this._takers.forEach(function (takers) {
        try {
            takers({
                done: true,
                error: false,
                value: message
            })
        } catch (err) {
            panic(err)
        }
    })
    this._senders.forEach(function (sender) {
        try {
            sender(false)
        } catch (err) {
            panic(err)
        }
    })
    this._takers = null
    this._senders = null
}

Port.prototype.throw = function (error) {
    if (this._done) { return }
    this._done = true
    this._error = true
    this._message = error

    this._reject(error)

    this._takers.forEach(function (taker) {
        try {
            taker({
                done: true,
                error: true,
                value: error
            })
        } catch (err) {
            panic(err)
        }
    })
    this._senders.forEach(function (sender) {
        try {
            sender(false)
        } catch (err) {
            panic(err)
        }
    })
    this._takers = null
    this._senders = null
}

Port.prototype.isDone = function () {
    return this._done
}

Port.prototype.isError = function () {
    if (!this._done) {
        throw new Error('Cannot check error from open port!')
    }
    return this._error
}

Port.prototype.getMessage = function () {
    if (!this._done) {
        throw new Error('Cannot get message from open port!')
    }
    return this._message
}
