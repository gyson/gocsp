
'use strict'

module.exports = Channel

var go = require('./index')
var noop = require('./util').noop
var Port = require('./port')
var assert = require('assert')
var defaults = require('./defaults')
var Writable = require('stream').Writable
var isWritable = require('./util').isWritable

function Channel(fn, opts) {

    Writable.call(this, { objectMode: true })

    var self = this
    this.on('finish', function (data) {
        self.input.close()
    })

    if (Array.isArray(fn)) {
        fn = defaults.through(fn)
    }

    opts = opts || {}

    this.input = opts.input || new Port()
    this.output = opts.output || new Port()

    fn(this.input, this.output)
}
require('util').inherits(Channel, Writable)

// for Writable
Channel.prototype._write = function (chunk, enc, next) {
    this.input._put(chunk, function (result) {
        // if result ?
        next()
    })
}

;['put', '_put', 'close', 'throw']
.forEach(function (method) {
    var fn = Port.prototype[method]
    Channel.prototype[method] = function () {
        return fn.apply(this.input, arguments)
    }
})

;['take', '_take', 'then', 'catch'].forEach(function (method) {
    var fn = Port.prototype[method]
    Channel.prototype[method] = function () {
        return fn.apply(this.output, arguments)
    }
})

Channel.prototype.each =
Channel.prototype.forEach = function (fn) {
    this.output.each(fn)
    return this
}

// pipe to channel or stream
Channel.prototype.pipe = function (dest, opts) {
    var autoClose = true
    var autoThrow = true
    if (opts && typeof opts.autoClose !== 'undefined') {
        autoClose = opts.autoClose
    }
    // if it's stream
    if (isWritable(dest)) {
        this.each(function (data) {
                dest.write(data)
            })
            .done(function (err) {
                if (err) { /* forward err ? */ }
                if (autoClose &&
                    dest !== process.stdout &&
                    dest!== process.stderr) {
                    dest.end()
                }
            })
        return dest
    }

    // if it's channel
    if (true) {
        // if it's channel
        // channel-pass
        // pass(opts)(this.output, dest.input, go)
        return dest
    }
    throw new TypeError('Invalid type to pipe')
}

Object.keys(defaults).forEach(function (name) {
    var fn = defaults[name]
    Channel[name] = function () {
        return new Channel(fn.apply(null, arguments))
    }
    Channel.prototype[name] = function () {
        var chan = new Channel()
        fn.apply(null, arguments)(this.output, chan.input)
        return chan
    }
})

// Channel
//     .pipe(fs.openRead())
//     .pipe(fs.openWrite())
//     .done(console.log)
//
// Channel.chain(function(){this
//     .through()
//     .through()
//     .buffer()
// })


// function map(fn) {
//     return function (input, output, go) {
//         go.spawn(function* () {
//
//             // if fn is genFun
//             //yield* fn(data)
//             // else
//             // just fn
//         })
//     }
// }

// // strategy
// function* _multiplex (readPorts, writePort) {
//     //
//     assertType(Array.isArray(readPorts) && readPorts.every(isReadable));
//     assertType(isWritable(writePort));
// }
//
// Channel.multiplex = function (channels, strategy) {
//     strategy = strategy || _multiplex;
//
// }
//
// function* _broadcast (readPort, writePorts) {
//     // select from any of readPort
//     assertType(Array.isArray(writePorts) && writePorts.every(isWritable));
//     assertType(isReadable(readPort));
//
// }


// set.remove, set.add, etc // has forEach methods
// Channel.prototype.broadcast = function (channels, strategy) {
//     strategy = strategy || _broadcast;
    // when i got everthing, ...
    // Promise.all(...)
    // add things
// }

// http://blog.cognitect.com/blog/2014/8/6/transducers-are-coming
// http://syssoftware.blogspot.com/2014/03/channels-and-pipes-close-and-errors.html
// http://syssoftware.blogspot.com/2014/03/channels-pipes-connections-and.html
// http://blog.golang.org/pipelines
// https://www.dartlang.org/slides/2013/06/dart-streams-are-the-future.pdf
// http://blog.cognitect.com/blog/2014/8/6/transducers-are-coming
// http://www.infoq.com/presentations/clojure-core-async
