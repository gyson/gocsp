'use strict';

module.exports = exports = Channel

var Future = require('./future')

// Channel#send('name') ? onClose: send(chan, t => t.filter(x => x))

function Channel(n) {
    if (n !== ~~n || n < 0) {
        throw new Error(n + ' must be non-negative integer')
    }
    this._closed = false
    this._error = null

    this._capacity = n
    this._size = 0 // + or -

    this._takeOps = new LinkList()
    this._putOps = new LinkList()

    var self = this
    self._future = new Future(function (cb) {
        self._cb = cb
    })
}

// ._take  // cancellable
// ._put   // cancellable
// ._close // ._close(value)
// ._wait(fn) // ?

// wait channel to be closed
// csp.wait(ch, function (obj) {
//    return obj
// })

// csp.close(ch, Promise.reject(123))

// next => app.async(function* (c) {
//
// })

// csp.chan()
// csp.take()
// csp.put()
// csp.close(ch) // ch._close()
// csp.select(s => s
//     .take(ch)
// )
// csp.each(ch, function () { ... })
// csp.transduce(ch, transducer) // => promise
// csp.observe(ch) // => return a observable: for (var x on csp.observe(ch)) { ... }

csp.take(ch)
csp.put(ch, value)
csp.select(s =>
    s.take(ch, function () {

    })
    ||
    s.take(ch, function () {

    })
)

// pipe(ch, p => p
//     .map(function () {
//
//     })
//     .filter(function () {
//
//     }))
//
// Channel.from(ch, function expand() {
//
// })
//
// expand(async function* () {
//
// })

// put(x, new Promise(function () { ... })) // ???


ch

.map
.mapAsync
.mapCallback(function (value, cb) {

})

.filter
.filterAsync(async function () {})
.filterCallback(function (value, cb))

.expand(function* () {})
.expandAsync(async function* ())
.expandCallback(function (value, next, cb) {
    next(abc)
    next(abc)
    cb(err)
    cb() // ok
})




// function map(x, cb) {
//     cb(err)
//     cb(null, value)
// }

// xxx.fromEvent(evt, 'name').filter().map().first()

// chan._take(function ({ done, value}) {
//
// })
// function take(ch) {
//     return new Promise(function (resolve) {
//         ch._take(resolve)
//     })
// }
//
// function put(ch, val) {
//     return new Promise(function (resolve) {
//         ch._put(val, resolve)
//     })
// }


// will only yield true thunk, no exception
// exception throw .done()
// {done, value} = .take()
Channel.prototype.take = function () {
    if (this._closed) {
        return Future.of(null, { done: true, value: this._error })
    }
    if (!this._putOps.isEmpty()) {
        var putOp = this._putOps.shift()
        putOp.cb(null, true)
        return Future.of(null, { done: false, value: putOp.value })
    }
    var ref, f = Future.raw(function () {
        if (ref) LinkList.remove(ref)
    })
    self._takeOps.push(f) // ._fill(err, val)
    return f
}

// chan.isChannel

var TRUE_FUTURE = Future.of(null, true)
var FALSE_FUTURE = Future.of(null, false)

/*
// done, value
{ done, value } = yield ch.take()
*/
Channel.prototype.put = function (data) {
    if (this._closed) {
        return FALSE_FUTURE
    }
    if (!this._takeOps.isEmpty()) {
        var takeOp = self._takeOps.shift()
        takeOp(null, { done: false, value: data })
        return TRUE_FUTURE
    }
    var ref, self = this
    return new Future(function (done, onAbort) {
        if (self._closed) {
            done(null, false)
            return
        }
        if (self._takeOps.isEmpty()) {
            ref = self._putOps.push({
                cb: done, value: data
            })
            return
        }
        var takeOp = self._takeOps.shift()
        takerOp(null, { done: false, value: data })
        done(null, true)
    }, function () {
        if (ref) {
            LinkList.remove(ref)
        }
    })
}

// this.cancel()

// chan2.closeFrom(chan1) => chan1.done(function (err) { chan2.close(err) })
// chan.delegate(chan2)
// cleanup sender's data
Channel.prototype.close = function (error) {
    // this._future ?
    if (this._done) { return }
    this._done = true
    // this._value = value
    // this._resolve(value)
    this._takers.shiftEach(function (takers) {
        // tryCatch(takers, {
        //     done: true,
        //     error: false,
        //     value: value
        // })
    // })
    this._senders.shiftEach(function (sender) {
        // tryCatch(sender, false)
    })
}

// when it's closed
// chan.done()
// chan.done(function (err) {
//
// }, function...)
// return a future ?
Channel.prototype.done = function (fn, handler) {
    // this._future.done(fn, handler)
    return new Future(function (cb) {
        // ...
    })
}

function panic(err) {
    setTimeout(function () {
        throw err
    }, 0)
}
