
'use strict';

// http://blog.cognitect.com/blog/2014/8/6/transducers-are-coming
// http://syssoftware.blogspot.com/2014/03/channels-and-pipes-close-and-errors.html
// http://syssoftware.blogspot.com/2014/03/channels-pipes-connections-and.html
// http://blog.golang.org/pipelines
// https://www.dartlang.org/slides/2013/06/dart-streams-are-the-future.pdf
// http://blog.cognitect.com/blog/2014/8/6/transducers-are-coming
// http://www.infoq.com/presentations/clojure-core-async
//
// new Channel('buffer', 10)
//
// new Channel('through',
//     fs.readFrom(),
//     fs.writeTo()
// )

// new Channel()
//     .pipe(fs.openRead())
//     .pipe(fs.openWrite())

// new Channel(fs.openRead()).toStream().pipe(fs.createWriteStream())

var go = require('./index')
var Port = require('./port')

module.exports = Channel

function Channel() {

    this.input = new Port();

    if (arguments.length === 0) {
        this.output = this.input;
        return;
    }

    // scan it...
    // this.input = new Port();
    // this.output = new Port();
}

// Channel.buffer(20)

// bad ?
// // put action works with Channel's input
// // then we can do
// chan.take(), chan.put(), yield go('take', chan)
['put', '_put'].forEach(function (method) {
    var fn = Port.prototype[method];
    Channel.prototype[method] = function () {
        return fn.apply(this.input, arguments);
    }
});

// take action works with Channel's output
['take', '_take'].forEach(function (method) {
    var fn = Port.prototype[method];
    Channel.prototype[method] = function () {
        return fn.apply(this.output, arguments);
    }
});

// function (xform) {
//     return function (input, output, go) {
//         go.spawn(function* () {
//             var list = []
//             var finish = false
//             var produce = xform(function (data, done) {
//                 if (done) {
//                     finish = true
//                 } else {
//                     list.push(data)
//                 }
//             })
//
//             for (;;) {
//                 var obj = yield go('take', input)
//                 if (obj.done) {
//                     // end of input
//                     produce(obj.value, true)
//                 } else {
//                     produce(obj.value)
//                 }
//                 for (var x of list) {
//                     if (! yield go('put', output, x)) {
//                         finish = true
//                         break
//                     }
//                 }
//                 list = []
//                 if (finish) {
//                     break
//                 }
//             }
//         }, function (err) {
//             input.close(err)
//             output.close(err)
//         })
//     }
// }


// pipe(fn) -> for now
// pipe(fn, ch)

// pipe(ch)
// pipe(ch, fn)
Channel.prototype.pipe = function (fn) {
    // fn => function (input, output, go)
    var ch = new Channel()
    fn(this.output, ch.input, go)
    return ch
}

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
Channel.prototype.broadcast = function (channels, strategy) {
    strategy = strategy || _broadcast;

    // when i got everthing, ...
    // Promise.all(...)

    // add things
}

// .fromEvent .pipeEvent

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

// Channel.buffer = function (maxSize, getSize) {
//     getSize = getSize || function () { return 1 }
//
//     return new Channel(function (input, output, go) {
//         go.run(function* () {
//
//             // if use event driven
//             input.listen(function () {
//                 // take it in buffer
//                 // return true if take
//                 // return false if not take
//             })
//
//             var buffer = [];
//
//             while (true) {
//
//                 // if ending! { break }
//
//                 // if empty
//                 yield go('take', function (result) {
//                     buffer.push(result);
//                     // check status
//                 })
//
//                 // if (full)
//                 yield go('put', buffer.shift(), function (result) {
//                     // ...
//                 })
//
//                 // if ok to put or take
//
//                 var data = buffer.shift();
//                 yield go('select'
//                     ['take', function (result) {
//                         buffer.unshift(data);
//                         // ..
//                         // ..
//                     }],
//                     ['put', data, function (result) {
//
//                     }]
//                 )
//             }
//
//             while (yield go('select',
//                 ['take', input, function (data) {
//
//                 }],
//                 ['put', output, data, function (result) {
//
//                 }]
//             ));
//
//
//         }, function (err) {
//             input.close();
//             output.close();
//         })
//     })
// }
//
//
// function buffer(size, getSizeOf) {
//     return function (input, output, go) {
//         // input.take()
//     }
// }
// exports.buffer = buffer
//
// function through() {
//     var fns = arguments
//     if (fns.length === 0) {
//         throw new Error('cannot pipe through nothing')
//     }
//     return function (input, output, go) {
//         var portIn = input, portOut
//
//         for (var i = 0; i < arguments.length - 1; i++) {
//             portOut = new go.Port()
//
//             fns[i](portIn, portOut, go)
//
//             portIn = portOut
//         }
//         fns[i](portIn, output, go)
//     }
// }
// exports.through = through
