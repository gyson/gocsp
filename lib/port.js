
'use strict'

var LinkList = require('./linklist')

module.exports = Port

function Port () {
    this._done = false
    this._error = false
    this._message = void 0

    this._takers = new LinkList()
    this._senders = new LinkList()

    // Native Promise does not support inherits yet !!!
    var self = this
    self._promise = new Promise(function (resolve, reject) {
        self._resolve = resolve
        self._reject = reject
    })
}
// require('util').inherits(Port, Promise)

Port.prototype.take = function () {
    var self = this
    return new Promise(function (resolve) {
        self._take(resolve)
    })
}

Port.prototype.put = function (data) {
    var self = this
    return new Promise(function (resolve) {
        self._put(data, resolve)
    })
}

function noop() {}
// dont care if received
Port.prototype.drop = function (data) {
    if (!this._done) {
        this._put(data, noop)
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

    while (!this._takers.isEmpty()) {
        this._takers.shift()({
            done: true,
            error: false,
            value: message
        })
    }
    while (!this._senders.isEmpty()) {
        var sender = this._senders.shift()
        // cleanup(sender.data) => try ... catch
        sender(false)
    }
}

Port.prototype.throw = function (error) {
    if (this._done) { return }
    this._done = true
    this._error = true
    this._message = error

    this._reject(error)

    while (!this._takers.isEmpty()) {
        this._takers.shift()({
            done: true,
            error: true,
            value: error
        })
    }
    while (!this._senders.isEmpty()) {
        var sender = this._senders.shift()
        // cleanup
        sender(false)
    }
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


// internal usage, release zalgo!
Port.prototype._take = function (cb) {
    if (this._done) {
        cb({ done: true, value: this._message })
        return
    }
    if (this._senders.isEmpty()) {
        return this._takers.push(cb) // handle object
    }
    var sender = this._senders.shift()
    sender(true)
    cb({ done: false, value: sender.data })
}

// internal usage, release zalgo!
Port.prototype._put = function (data, cb) {
    if (this._done) {
        cb(false)
        return
    }
    if (this._takers.isEmpty()) {
        cb.data = data
        return this._senders.push(cb)
    }
    var taker = this._takers.shift()
    taker({ done: false, value: data })
    cb(true)
}
