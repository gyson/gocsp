'use strict';

module.exports = exports = Channel

var LinkList = require('link-list')

var thunk = require('./thunk')

// chan with transducers support

// chan
// chan2(1)

// chan.readable(chan)
// chan.writable(chan)

// channel with transduce ? no
// chan(map)

// readable(channel)
// readable(stream) // duplex stream
// writable(channel)
// writable(stream)
// asReadableChannel()
// asWritableChannel() // readable... writable

// chan(10) // why transformation
// new Channel()



// chan.Readable(chan)
// chan.Writable(stream) // cast stream to channel

// var chan2
// pipe(p => p.from(chan).compose(xform).to(chan2))

// return a channel that
// chan.transduce(xform, fn, init)

// var chan = new Channel()

// chan.input
// chan.output

// pipe(p => p
//     .from(chan)
//     .compose(xform)
//     .reduce(fn, init)
// )

// chan.read(chan)
// chan.readonly() // return a instanc

// read only chan
// write only chan
// read write chan

// new Channel(10, xform).done()(function (err, result) {
//
// })

var nextTick = (process && process.nextTick) || setImmediate
            || function (fn) { setTimeout(fn, 0) }

function noop() {}

// input is stream, output is chan
// input is chan, input is stream
// input is stream, output is stream
// input is chan, output is chan

// chan.readable() // =>
// chan.writable() // =>
// mapAsync(input, output) {
//
// }

// { timeout, transduce, pipe } from 'core/async'
// core/async/timeout
// core/async/thunk
// core/transduce

function identity(x) { return x }

function Result(done, value) {
    this.done = done
    this.value = value
}

function Operation(done, value, cb) {
    this.done = done
    this.value = value
    this.cb = cb
}

var OPEN    = 0
var STOP    = 1
var CLOSING = 2
var CLOSED  = 3
var ERRORED = 4

// chan.filter(10, function () {
//
// })

// Channel.map(10, function () {
//
// })

// Channel.decode(10)

// Channel.chain(10, c => c
//     .map(function () {
//
//     })
//     .filter(function () {
//
//     })
// )

// var ch = Channel.each(10, console.log)

// pipe(p => p
//     .from(chan)
//     .each(function () {
//
//     })
//     // parallel ?
//     .mapAsync(function* () {
//
//     })
// )

// chan(10, T.each(function () {
//
// }))

// Object.keys(transy.methods).forEach(function (name) {
//     var f = transy.methods[name]
//     Channel[name] = function (size, a, b, c) {
//         switch (arguments.length) {
//         case 0:
//             return new Channel(0, f())
//         case 1:
//             return new Channel(size, f())
//         case 2:
//             return new Channel(size, f(a))
//         case 3:
//             return new Channel(size, f(a, b))
//         case 4:
//             return new Channel(size, f(a, b, c))
//         default:
//             var len = arguments.length - 1
//             var args = new Array(len)
//             for (var i = 0; i < len; i++) {
//                 args[i] = arguments[i+1]
//             }
//             return new Channel(size, f.apply(void 0, args))
//         }
//     }
// })

// Channel.chain(10, c => c
//     .each(console.log)
//     .map(x => x + 1)
//     .filter(x => x > 20)
//     .expand(x => [x, x])
//     .each(file => file.name = file.name + '-test')
//     .compose(
//         buffer.encode('utf8'),
//         buffer.decode('utf8'),
//         doSomethingCool('utf8')
//     )
//     .concat([], function cb(err, res) {
//         // ...
//         // let me know that it's ok
//     })
// )

function Reciver(chan) {
    this.chan = chan
}
Reciver.prototype.init = noop
Reciver.prototype.step = function (res, val, reduced) {
    // push to next
    // if this.abcd, then stop, else
}
Reciver.prototype.result = function (res) {

}
Reciver.prototype.dispose = noop

function Channel (max, fn) {
    // if ... return new Channel(max, fn)
    max = max || 0
    xform = xform || identity

    if (max === +max) {
        throw new TypeError(max + ' is not number')
    }
    if (typeof xform === 'function') {
        throw new TypeError(xform + ' is not function')
    }

    var self = this

    self._max = max
    self._length = 0
    self._state = OPEN
    self._reason = null
    self._done = thunk(function (cb) {
        self._callback = cb
    })
    self._done(noop) // make sure it won't throw if no listener

    self._queue = new LinkList()
    self._putOps = new LinkList()
    self._takeOps = new LinkList()

    self._transform = xform(function (done, value) {
        // noop if closing, closed or errored
        if (self._state >= CLOSING) {
            return true
        }
        if (done) {
            // early termination or `.close` is called
            self._state = CLOSING
            self._reason = value

            // discard all put operations if any
            self._putOps.shiftEach(function (putOp) {
                putOp.cb(null, false)
            })

            if (self._queue.isEmpty()) {
                toClosedState(self, value)
            }
        } else {
            self._length += 1
            if (self._takeOps.isEmpty()) {
                self._queue.push(value)
            } else {
                self._takeOps.shift()(null, new Result(false, value))
            }
        }
        return done
    })
}

Channel.prototype.take =
Channel.prototype.nextAsync = function () {
    var self = this
    var ref = null
    return thunk(function (cb) {
        if (self._state === CLOSED) {
            cb(null, new Result(true, self._reason))
            return
        }
        if (self._state === ERRORED) {
            cb(self._reason)
            return
        }
        // then it's OPEN, STOP, CLOSING
        self._length -= 1
        if (self._queue.isEmpty()) {
            ref = self._takeOps.push(cb)
        } else {
            cb(null, new Result(false, self._queue.shift()))
        }

        while (self._state < CLOSING
            && !self._putOps.isEmpty()
            && self._length < self._max) {
            // take one operation from put operations
            var op = self._putOps.shift()
            try {
                self._transform(op.done, op.value)
                if (op.done && self._state < CLOSING) {
                    throw new Error('not closing properly')
                }
                op.cb(null, true)
            } catch (e) {
                op.cb(null, false)
                toErroredState(self, e)
                return
            }
        }

        if (self._queue.isEmpty() && self._state === CLOSING) {
            toClosedState(self, self._reason)
        }

    }, function cancelTake() {
        // check if it's cancellable
        if (ref && ref.prev && ref.next) {
            self._length += 1
            LinkList.remove(ref)
        }
    })
}

// make it cancellable
var THUNK_TRUE = thunk(function (cb) { cb(null, true) }, noop)
var THUNK_FALSE = thunk(function (cb) { cb(null, false) }, noop)

Channel.prototype.put = function (value) {
    if (this._state > OPEN) {
        return THUNK_FALSE
    }
    if (this._putOps.isEmpty() && this._length < this._max) {
        try {
            this._transform(false, value)
        } catch (e) {
            toErroredState(this, e)
            return THUNK_FALSE
        }
        return THUNK_TRUE
    } else {
        var ref = null
        var self = this
        return thunk(function (cb) {
            ref = self._putOps.push(new Operation(false, value, cb))
        }, function cancelPut() {
            if (ref) {
                LinkList.remove(ref)
            }
        })
    }
}

Channel.prototype.close = function (reason) {
    if (this._state > 0) { return false }
    this._state = STOP
    if (this._putOps.isEmpty()) {
        try {
            this._transform(true, reason)
            if (this._state < CLOSING) {
                throw new Error('not closing properly')
            }
        } catch (e) {
            toErroredState(this, e)
        }
    } else {
        this._putOps.push(new Operation(true, reason, noop))
    }
    return true
}

// .cancel => in close state
// clear all put / close operation
// clear all queue
// on cancellation
// on close state with reason
Channel.prototype.cancel = function (reason) {
    return toClosedState(this, reason)
}

// .abort => in error state
// clear all put / close operation
// clear all queue
// on error state with reason
Channel.prototype.abort = function (reason) {
    return toErroredState(this, reason)
}

Channel.prototype.isReadable =
Channel.prototype.isWritable = function () {
    return true
}

function toClosedState(chan, reason) {
    // noop if closed or errored
    if (chan._state >= CLOSED) { return false }
    chan._state = CLOSED
    chan._reason = reason

    // cleanup
    chan._putOps.shiftEach(function (putOp) {
        putOp.cb(null, false)
    })

    chan._takeOps.shiftEach(function (takeOp) {
        takeOp(null, new Result(true, reason))
    })

    chan._queue = null
    chan._putOps = null
    chan._takeOps = null

    chan._callback(null, reason)
    return true
}

function toErroredState(chan, reason) {
    // noop if closed or errored
    if (chan._state >= CLOSED) { return false }
    chan._state = ERRORED
    // override reason if it's falsy value
    if (!reason) {
        reason = new Error('Reason is not specified')
    }
    chan._reason = reason

    // cleanup
    chan._putOps.shiftEach(function (putOp) {
        putOp.cb(null, false)
    })

    chan._takeOps.shiftEach(function (takeOp) {
        takeOp(reason)
    })

    chan._queue = null
    chan._putOps = null
    chan._takeOps = null

    chan._callback(reason)
    return true
}

// you can override it, eg. gocsp-fs.createReadChannel()
Channel.prototype.done = function () {
    return this._done
}

// TODO ?
function isChannel(obj) {
    return obj
        && typeof obj.take === 'function'
        && typeof obj.put  === 'function'
}
Channel.isChannel = isChannel
