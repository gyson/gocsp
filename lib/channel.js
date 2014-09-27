
'use strict';

// http://blog.cognitect.com/blog/2014/8/6/transducers-are-coming
// http://syssoftware.blogspot.com/2014/03/channels-and-pipes-close-and-errors.html
// http://syssoftware.blogspot.com/2014/03/channels-pipes-connections-and.html
// http://blog.golang.org/pipelines
// https://www.dartlang.org/slides/2013/06/dart-streams-are-the-future.pdf
// http://blog.cognitect.com/blog/2014/8/6/transducers-are-coming
// http://www.infoq.com/presentations/clojure-core-async

// Channel
//     .through(fs.openRead())
//     .through(fs.openWrite())
//     .done(console.log)
//
// Channel.chain(function(){this
//     .through()
//     .through()
//     .buffer()
// })

// new Channel(fs.openRead()).toStream().pipe(fs.createWriteStream())

var go = require('./index')
var Port = require('./port')
var defaults = require('./defaults')
var Writable = require('stream').Writable

module.exports = Channel

function Channel(fn) {

    Writable.call(this, {objectMode: true})

    var self = this
    this.on('finish', function (data) {
        self.input.close()
    })

    this.input = new Port()
    if (arguments.length === 0) {
        this.output = this.input
        return
    }
    this.output = new Port()
    fn(this.input, this.output, go)

    // if fn is genFun
    // new Coroutine(fn(input, output, go)).next()
}
require('util').inherits(Channel, Writable)

// for Writable
Channel.prototype._write = function (chunk, enc, next) {
    this.input._put(chunk, function (result) {
        next()
    })
}

// bad ?
// // put action works with Channel's input
// // then we can do
// chan.take(), chan.put(), yield go('take', chan)
;['put', '_put', 'close'].forEach(function (method) {
    var fn = Port.prototype[method]
    Channel.prototype[method] = function () {
        return fn.apply(this.input, arguments)
    }
})

// take action works with Channel's output
;['take', '_take', 'then'].forEach(function (method) {
    var fn = Port.prototype[method]
    Channel.prototype[method] = function () {
        return fn.apply(this.output, arguments)
    }
})

// pipe to channel or stream
Channel.prototype.pipe = function (dest, opts) {
    var autoClose = true;
    if (opts && typeof opts.autoClose !== 'undefined') {
        autoClose = opts.autoClose
    }
    // if it's stream
    if (dest.write && dest.end) {
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
    } else {
        // if it's channel
        defaults.pass(opts)(this.output, dest.input, go)
    }
    return dest
}

Object.keys(defaults).forEach(function (name) {
    var fn = defaults[name]
    Channel[name] = function () {
        return new Channel(fn.apply(null, arguments))
    }
    Channel.prototype[name] = function () {
        var chan = new Channel()
        fn.apply(null, arguments)(this.output, chan.input, go)
        return chan
    }
})

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
//
// Channel.pipe(ch) // identity
// to be dynamic
// chan.broadcast(set)

// set.remove, set.add, etc // has forEach methods
// Channel.prototype.broadcast = function (channels, strategy) {
//     strategy = strategy || _broadcast;
    // when i got everthing, ...
    // Promise.all(...)
    // add things
// }

// Channel.prototype.pipeEvent = function (event, onData, onClose) {
//     onData = onData || 'data';
//     onClose = onClose || 'close';
//
//     var output = this.output;
//
//     go.run(function* () {
//         var res;
//         while (res = yield go('take', output), !res.done) {
//             event.emit(onData, res.value);
//         }
//         event.emit(onClose, res.value)
//     })
// }
