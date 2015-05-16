'use strict';

module.exports = exports = Future

var INTERNAL = {}
var PENDING = {}
var CANCELLED = {}

function Future(initFn, cancelFn) {
    this._c = cancelFn

    this._e = Future.longStackTraces ? new Error() : undefined
    this._v = PENDING

    this._f = undefined
    this._x = undefined
    this._y = undefined
    this._z = undefined

    if (initFn !== INTERNAL) {
        tryInit(initFn, createCallback(this))
    }
}

function tryInit(init, cb) {
    try { init(cb) } catch (e) { cb(e) }
}

Future.prototype.__future__ = true // version ?

Future.prototype._fill = function (err, val) {
    if (this._v !== PENDING) { return }
    if (err && this._e && typeof err.stack === 'string') {
        err.stack += '\n----\n' + (typeof this._e === 'string'
                                        ? this._e
                                        : format(this._e.stack))
    }
    this._e = err
    this._v = val
    if (this._f) {
        this._f(err, val, this._x, this._y, this._z)
        var i = 0;
        var obj = this[i]
        while (obj) {
            obj._f(err, val, obj._x, obj._y, obj._z)
            i++
            obj = this[i]
        }
    }
}

Future.prototype._attach = function (str) {
    if (Future.longStackTraces) { return this }
    if (this._v === PENDING || this._v === CANCELLED) {
        this._e = str
    } else {
        if (this._e && typeof this._e.stack === 'string') {
            this._e.stack += '\n----\n' + str
        }
    }
    return this
}

Future.prototype._listen = function (f, x, y, z) {
    if (this._v === PENDING || this._v === CANCELLED) {
        if (this._f) {
            var i = 0
            while (this[i]) {
                i++
            }
            this[i] = new Listener(f, x, y, z)
        } else {
            this._f = f
            this._x = x
            this._y = y
            this._z = z
        }
    } else {
        f(this._e, this._v, x, y, z)
    }
}

function Listener(f, x, y, z) {
    this._f = f
    this._x = x
    this._y = y
    this._z = z
}

function createCallback(self) {
    return function (err, val) {
        self._fill(err, val)
    }
}

// if parent is cancellable, then it is cancellable
// other wise, it's not cancellable
Future.prototype.pass = function (onOk, onFail) {
    var result = new Future(INTERNAL, this._c ? this : undefined)
    this._listen(tryPass, result, onOk, onFail)
    return result
}

function tryPass(err, val, dest, onOk, onFail) {
    try {
        if (err) {
            typeof onFail === 'function'
            ? onFail(createCallback(dest), err)
            : dest._fill(err, val)
        } else {
            typeof onOk === 'function'
            ? onOk(createCallback(dest), val)
            : dest._fill(err, val)
        }
    } catch (e) {
        dest._fill(e, undefined)
    }
}

Future.prototype.then = function (onResolve, onReject) {
    var result = new Future(INTERNAL, this._c ? this : undefined)
    this._listen(tryThen, result, onResolve, onReject)
    return result
}

function tryThen(err, val, dest, onResolve, onReject) {
    try {
        if (err) {
            typeof onReject === 'function'
                ? dest._fill(null, onReject(err))
                : dest._fill(err, val)
        } else {
            typeof onResolve === 'function'
                ? dest._fill(null, onResolve(val))
                : dest._fill(err, val)
        }
    } catch (e) {
        dest._fill(e)
    }
}

Future.prototype['catch'] = function (onReject) {
    return this.then(undefined, onReject)
}

// Future_done
Future.prototype.done = function (fn, handler) {
    this._listen(tryDone, fn, handler, undefined)
}

function tryDone(err, val, fn, handler, z) {
    try { fn(err, val) } catch (e) {
        if (typeof handler === 'function') {
            try { handler(e) } catch (e2) {
                panic(e2)
            }
        } else {
            panic(e)
        }
    }
}

// return then error if successful
// return undefined if failed, just like noop
Future.prototype.cancel = function (reason) {
    if (this._v === PENDING && this._c) {
        // reject self with this.reason
        if (typeof this._c === 'function') {
            this._v = CANCELLED
            var error = tryCancel(this._c, reason)
        } else {
            if (!isFuture(this._c)) {
                return
            }
            this._v = CANCELLED
            var error = this._c.cancel(reason) || new Error('cancelled')
        }
        this._v = PENDING
        this._fill(error)
        return this._e
    }
}

// tryCancel, may use CancelError
function tryCancel(cancel, reason) {
    try {
        cancel(reason)
        return new Error('cancelled') // return this.cancel()
    } catch (e) {
        // override if falsy value
        return e || new Error('cancelled')
    }
}

// future.toPromise() // toPromsise
Future.prototype.toPromise = function () {
    if (!Promise) {
        throw new Error('Cannot found Promise')
    }
    var self = this
    return new Promise(function (resolve, reject) {
        self._listen(tryPromise, resolve, reject, undefined)
    })
}

// no need try...catch, since resolve and reject wont throw
function tryPromise(err, val, resolve, reject, z) {
    err ? reject(err) : resolve(val)
}

// static methods

var ignore = new RegExp(''
    + 'gocsp/future.js:|'
    + 'gocsp/go.js:|'
    + 'timers.js:|module.js:|fs.js:|node.js|'
    + 'GeneratorFunctionPrototype.next'
)

function format(stack) {
    var message = ''
    var lines = stack.split('\n').slice(1)
                    .filter(function (line) {
                        return !line.match(ignore)
                    })
    if (lines.length > 0) {
        message += lines.join('\n')
    }
    return message
}
Future.format = format

Future.longStackTraces = false

// if env is node
if (process && process.env) {
    if (process.env.GOCSP_DEBUG == 1) {
        Future.longStackTraces = true
    }
}

// Future.version
function isFuture(obj) {
    return obj && obj.__future__ // version
}
Future.isFuture = isFuture

function raw(cancelFn) {
    return new Future(INTERNAL, cancelFn)
}
Future.raw = raw

// cast future, promise to future
function from(obj) {
    if (isFuture(obj)) {
        return obj
    }
    return new Future(function (cb) {
        if (obj && typeof obj.then === 'function') {
            // it's promise
            obj.then(function (val) {
                cb(null, val)
            }, cb)
        } else {
            throw new TypeError(obj + ' is not future or promise')
        }
    })
}
Future.from = from

// similar to Promise.resolve and .reject
function of(err, val) {
    // return new Future(INTERNAL, undefined)
    return new Future2(err, val)
}
Future.of = of

// FutureOf
function Future2(err, val) {
    this._e = err
    this._v = val
}
Future2.prototype = Object.create(Future.prototype, {
    constructor: {
        value: Future, // override
        enumerable: false,
        writable: true,
        configurable: true
    }
})
Future2.prototype._c = undefined
Future2.prototype._f = undefined
Future2.prototype._x = undefined
Future2.prototype._y = undefined
Future2.prototype._z = undefined

// quick way to use callback-based functions
function run(ctx, method, a, b, c, d) {
    var f = Future.raw()
    var cb = function (err, val) {
        f._fill(err, val)
    }
    var len = arguments.length
    try {
        switch (len) {
        case 3: ctx[method](a, cb);          return f
        case 4: ctx[method](a, b, cb);       return f
        case 2: ctx[method](cb);             return f
        case 5: ctx[method](a, b, c, cb);    return f
        case 6: ctx[method](a, b, c, d, cb); return f
        default:
            var args = new Array(len-1)
            for (var i = 2; i < len; i++) {
                args[i-2] = arguments[i]
            }
            args[len-2] = cb
            ctx[method].apply(ctx, args)
            return f
        }
    } catch (e) {
        cb(e)
        return f
    }
}
Future.run = run

// helper functions

function panic(err) {
    setTimeout(function () {
        throw err
    }, 0)
}
Future.panic = panic
