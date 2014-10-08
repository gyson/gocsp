
'use strict';

var panic = require('./util').panic
var run = require('./coroutine').run
var isGenFun = require('./util').isGenFun
var LinkList = require('./linklist')

function sleep(time) {
    return function (resolve, reject) {
        setTimeout(resolve, time)
    }
}
exports.sleep = sleep

function defer() {
    return function (resolve, reject) {
        setImmediate(resolve)
    }
}
exports.defer = defer

function nextTick() {
    return function (resolve, reject) {
        process.nextTick(resolve)
    }
}
exports.nextTick = nextTick

function once(event, type) {
    return function (resolve, reject) {
        event.once(type, resolve)
    }
}
exports.once = once

function task(t) {
    return t
}
exports.task = task

function thunk(t) {
    return function (resolve, reject) {
        t(function (err, data) {
            err ? reject(err) : resolve(data)
        })
    }
}
exports.thunk = thunk

function await(promise) {
    return function (resolve, reject) {
        promise.then(resolve, reject)
    }
}
exports.await = await

function take(chan) {
    return function (resolve, reject) {
        port._take(resolve)
    }
}
exports.take = take

function put(chan, value) {
    return function (resolve, reject) {
        chan._put(value, resolve)
    }
}
exports.put = put

/*
yield go.select ->
  @await promise1
  @await promise2
  @await promise3
  @timeout 1000, ->
    // handle timeout!

go.select(s => s
    .take(value, function () {

    })
    .put(value, function () {

    })
    .timeout(1000, function () {

    })
    .once(event, 'done', function () { ... })
)
*/

function select(fn) {
    return function (resolve, reject) {
        var selector = new Selector(resolve, reject)
        try {
            fn.call(selector, selector)
        } catch (err) {
            cleanup(selector)
            throw err
        }
    }
}
exports.select = select

// new Promise(go.select(s => s
//     .take()
//     .once()
//     .timeout()
// ))

// for debug
// if debug
if (false) {
    Object.keys(exports).forEach(function (name) {
        var fn = exports[name]
        exports[name] = function () {
            var ret = fn.apply(this, arguments)
            ret.stack = new Error().stack
            return ret
        }
    })
}


function cleanup(selector) {
    if (selector._done) { return }
    selector._done = true
    selector._callbacks.forEach(LinkList.remove)
    selector._listeners.forEach(function (cancel) {
        cancel()
    })
    selector._callbacks = null
    selector._ports = null
}

function execute(selector, fn, obj) {
    if (typeof fn === 'function') {
        if (isGenFun(fn)) {
            run(fn(obj), selector._resolve, selector._reject)
        } else {
            try {
                selector._resolve(fn(obj))
            } catch (err) {
                selector._reject(err)
            }
        }
    } else {
        selector._resolve(obj)
    }
}

function Selector(resolve, reject) {
    this._done = false
    this._listeners = []
    this._callbacks = []
    this._ports = new WeakSet()

    self._resolve = resolve
    self._reject = reject
}

// .take(chan, fn)
Selector.prototype.take = function (port, fn) {
    if (this._done) { return }

    // check if it's channel
    port = port.output || port

    if (this._ports.has(port)) {
        throw new Error('Cannot have duplicated port!')
    }
    this._ports.add(port)

    var self = this
    var item = port._take(function (data) {
        cleanup(self)
        execute(self, fn, data)
    })

    if (!this._done) {
        this._callbacks.push(item)
    }
}

// .put(chan, value, fn)
Selector.prototype.put = function (port, value, fn) {
    if (this._done) { return }

    // check if it's channel
    port = port.input || port

    if (this._ports.has(port)) {
        throw new Error('Cannot have duplicated port!')
    }
    this._ports.add(port)

    var self = this
    var item = port._put(value, function (result) {
        cleanup(self)
        execute(self, fn, result)
    })

    if (!this._done) {
        this._callbacks.push(item)
    }
}

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
}

// .task(abc, resolve, reject)
Selector.prototype.task = function (task, resolve, reject) {
    if (this._done) { return }

    return this.await(new Promise(task), resolve, reject)
}

// .thunk(thunk, cb)
Selector.prototype.thunk = function (thunk, handler) {
    if (this._done) { return }

    var self = this
    thunk(function (err, data) {
        cleanup(self)
        if (typeof handler === 'function') {
            execute(self, handler.bind(void 0, err, data))
        } else {
            err ? self._reject(err) : self._resolve(data)
        }
    })
}

// .once(event, type, function (data))
Selector.prototype.once = function (event, type, handler) {
    if (this._done) { return }

    var self = this
    var listener = event.on(type, function (data) {
        cleanup(self)
        execute(self, handler, data)
    })
    this._listeners.push(function () {
        event.removeListener(listener)
    })
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
}
