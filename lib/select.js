
'use strict'

module.exports = select

var noop = require('./util').noop
var panic = require('./util').panic
var isGenFun = require('./util').isGenFun
var Promise = require('./promise')

/*
yield go.select ->
  @await promise1
  @await promise2
  @await promise3
  @timeout 1000, ->
    // handle timeout!

go.select(s => s
    .take(chan, function () {

    })
    .put(chan, value, function () {

    })
    .timeout(1000)

    .once(event, 'done', function () { ... })
)
*/

function select(fn, cb) {
    // return a promise ?
    return new Promise(function (resolve, reject) {
        var selector = new Selector(resolve, reject)
        try {
            fn.call(selector, selector)
        } catch (err) {
            cleanup(selector)
            throw err
        }
    })
}

function Selector(resolve, reject) {
    this._done = false
    this._listeners = []
    this._cancels = []
    this._ports = new WeakSet()

    this._resolve = resolve
    this._reject = reject
}

// .take(chan, fn)
Selector.prototype.take = function (chan, fn) {
    if (this._done) { return }

    if (this._ports.has(chan)) {
        throw new Error('Cannot have duplicated chan!')
    }
    this._ports.add(chan)

    var self = this
    var item = chan.take(function (data) {
        cleanup(self)
        execute(self, fn, data)
    })

    if (!this._done) {
        this._cancels.push(function () {
            chan.cancel(item)
        })
    }

    return this
}

// .put(chan, value, fn)
// if it return a promise / function (co)
Selector.prototype.put = function (chan, value, fn) {
    if (this._done) { return }

    if (this._ports.has(chan)) {
        throw new Error('Cannot have duplicated chan!')
    }
    this._ports.add(chan)

    var self = this
    var item = chan.put(value, function (result) {
        cleanup(self)
        execute(self, fn, result)
    })

    if (!this._done) {
        this._cancels.push(function () {
            chan.cancel(item)
        })
    }

    return this
}

// .await(thunk, cb)
// .await(promise, resolve, reject)
Selector.prototype.await = function (promise, res, rej) {
    if (this._done) { return }

    var self = this
    promise.then(function (obj) {
        if (self._done) { return }

        cleanup(self)

        if (res) {
            execute(self, res, obj)
        } else {
            self._resolve(obj)
        }
    }, function (err) {
        if (self._done) { return }

        cleanup(self)

        if (rej) {
            execute(self, rej, err)
        } else {
            self._reject(err)
        }
    })

    return this
}

// make it the same
// .await(thunk, cb) ?
/*
    .await(promise, co(function* (resolved) {
        // ...
        // ...
    }))
    .await(promise, co(function* (data) {

    }))
    .thunk(promise, function (err, data) {

    })
    go.select(s => s
        .await(promise, onFulfilled, onRejected)
        .thunk(promise, callback)
    )
*/
Selector.prototype.thunk = function (thunk, handler) {
    if (this._done) { return }

    var self = this
    var called = false

    function callback(err, data) {
        if (called) { return }
        called = true

        cleanup(self)
        if (typeof handler === 'function') {
            execute(self, function () {
                handler(err, data)
            })
        } else {
            err ? self._reject(err) : self._resolve(data)
        }
    }

    try {
        self._resolve(thunk(callback))
    } catch (err) {
        self._reject(err)
    }
    return this
}

// .once(event, type, function (data))
Selector.prototype.once = function (event, type, handler) {
    if (this._done) { return }

    var self = this
    function listener(data) {
        cleanup(self)
        execute(self, handler, data)
    }
    this._cancels.push(function () {
        event.removeListener(listener)
    })
    event.on(type, listener)

    return this
}

// .timeout(time, fn)
Selector.prototype.timeout = function (time, fn) {
    if (this._done) { return }

    var self = this
    setTimeout(function () {
        if (self._done) { return }
        cleanup(self)
        execute(self, fn)
    }, time)

    return this
}

function cleanup(selector) {
    if (selector._done) { return }
    selector._done = true
    selector._cancels.forEach(function (cancel) {
        cancel()
    })
    selector._cancels = null
    selector._ports = null
}

function execute(selector, fn, obj) {
    if (typeof fn === 'function') {
        try {
            var result = fn(obj)

            // returned a promise
            if (result && typeof result.then === 'function') {
                selector._resolve(result)
                return
            }

            // co function
            if (typeof result === 'function') {
                result(function (err, data) {
                    if (err) {
                        selector._reject(err)
                    } else {
                        selector._resolve(data)
                    }
                })
            }
        } catch (err) {
            selector._reject(err)
        }
    } else {
        selector._resolve(obj)
    }
}
