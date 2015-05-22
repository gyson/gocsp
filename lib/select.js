'use strict';

var Promise = require('bluebird')

// csp.select(s =>
//     s.take(ch1, function ({ done, value }) {
//
//     })
//     ||
//     s.put(ch2, 123, function (ok) {
//
//     })
//     ||
//     s.timeout(1000, function () {
//
//     })
//     ||
//     s.default(function () {
//
//     })
// )

module.exports = function select(fn) {
    return new Promise(function (resolve, reject) {
        var s = new Selector(resolve)
        try {
            fn(s)
        } catch (e) {
            if (!s._selected) {
                s._clear()
                reject(e)
            }
        }
    }).then(exec)
}

function noop() {}

function exec(obj) {
    var f = obj.handler || noop
    return f(obj.result)
}

function Selector(resolve) {
    this._selected = false
    this._resolve = resolve
    this._timeout = null
    this._chans = []
    this._refs = []
}

// Object.defineProperty(Selector.prototype, 'selected', {
//     get: function () {
//         return this._selected
//     }
// })

Selector.prototype.take = function (ch, handler) {
    // check ch
    var self = this
    if (!self._selected) {
        var ref = ch._take(function (result) {
            self._clear()
            self._resolve({
                handler: handler,
                result: result
            })
        })
        if (!self._selected) {
            self._chans.push(ch)
            self._refs.push(ref)
        }
    }
    return self._selected
}

Selector.prototype.put = function (ch, val, handler) {
    // check ch
    var self = this
    if (!self._selected) {
        var ref = ch._put(val, function (result) {
            self._clear()
            self._resolve({
                handler: handler,
                result: result
            })
        })
        if (!self._selected) {
            self._chans.push(ch)
            self._refs.push(ref)
        }
    }
    return self._selected
}

Selector.prototype.timeout = function (time, handler) {
    var self = this
    if (self._timeout) {
        throw new Error('You can only call `.timeout` at most once.')
    }
    if (!self._selected) {
        self._timeout = setTimeout(function () {
            self._timeout = null
            self._clear()
            self._resolve({
                handler: handler,
                result: undefined
            })
        }, time)
    }
    return self._selected
}

Selector.prototype.default = function (handler) {
    if (!this._selected) {
        this._clear()
        this._resolve({
            handler: handler,
            result: undefined
        })
    }
    return this._selected
}

Selector.prototype._clear = function (cb, result) {
    if (this._selected) {
        return
    }
    this._selected = true

    // clear timeout
    if (this._timeout) {
        clearTimeout(this._timeout)
    }
    this._timeout = null

    // clear channels
    for (var i = 0, len = this._chans.length; i < len; i++) {
        this._chans[i]._cancel(this._refs[i])
    }
    this._chans = null
    this._refs = null
}

// s.resolve: clear and resolve promise
// s.reject: clear and reject promise
// s.defer: defer operation (like try ... finally ...)
// s.wait: wait a promise
