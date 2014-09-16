
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


// Channel(
//     ['through', fs.readFrom()],
//     ['through', fs.writeTo()],
//     ['done', console.log],
//     ['catch', console.log],
//     ['map', ...],
//     ['filter', ...]
//     ['compose', split(), map(), filter()] // only bulit-in functions for compose
// )
// .pipe(ch, ['through', function (input, output, go) {
//
// }])
//
// go.buffer(size, function getSize(obj) {
//     return 1;
//     return obj.length;
//     return Buffer.byteLength(obj, 'utf8')
// })

// fs.readFile = function () {
//     return function (input, output, go) {
//
//         function read (input, output) {
//
//         }
//
//         var inter = new go.Port();
//
//         read(input, inter);
//         go.buffer(size, fn)(inter, output, go);
//
//         input.pipe(...)
//
//         go.buffer(1000); // => function (input, output, go)
//
//         go.through(input, fn, new Port(), go.buffer, output)
//     }
// }

// Channel('through',
//     fs.readFrom(),
//     fs.writeTo()
// )
//
// go('through', fs.readFrom(), fs.writeTo()) => medium
//
// ['through', fs.readFrom(), fs.writeTo()]
// ['compose', split('...')]
//
// Channel()
//     .pipe(ch / port, fs.readFrom()) // through function
//     .pipe(fs.writeTo())
//
// transpose(
//     ['compose', xxx, xxx, xxx]
//     ['map', ...]
//     ['filter', ...]
// )
//
// Channel('through',
//     fs.readFrom(),
//     fs.writeTo()
// ).pipe(ch, ['through', fn])
//
// .pipe(['through', fn]) // create a ne

var Port = require('./port');

// function (input, output, go) {
//     go.run(function* () {
//
//         while (...) {
//
//         }
//
//     }, function (err) {
//         // handle error
//     })
// }

function Channel() {

    this.input = new Port();

    if (nothing) {
        this.output = this.input;
    }

    // scan it...
    // this.input = new Port();
    // this.output = new Port();
}

// put action works with Channel's input
// then we can do
// chan.take(), chan.put(), yield go('take', chan)
['put', '_canPut', '_doPut', '_cbPut'].forEach(function (method) {
    var fn = Port.prototype[method];
    Channel.prototype[method] = function () {
        return fn.apply(this.input, arguments);
    }
});

// take action works with Channel's output
['take', '_canTake', '_doTake', '_cbTake'].forEach(function (method) {
    var fn = Port.prototype[method];
    Channel.prototype[method] = function () {
        return fn.apply(this.output, arguments);
    }
});

/*
    socket.pipe(function (input, output, go) {
        // get from input
        // pipe to output
    }, socket)

    pipe(nodeStream)

    socket.pipe(function (input, output, go) {

    })
    .pipe(..., socket)
    // create a new channel, which input is output of socket
    // output is new Port()

*/
Channel.prototype.pipe = function (fn, chan) {
    // .call
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

Channel.prototype.pipeEvent = function (event, onData, onClose) {
    onData = onData || 'data';
    onClose = onClose || 'close';

    var output = this.output;

    go.run(function* () {
        var res;
        while (res = yield go('take', output), !res.done) {
            event.emit(onData, res.value);
        }
        event.emit(onClose, res.value)
    })
}

Channel.buffer = function (maxSize, getSize) {
    getSize = getSize || function () { return 1 }

    return new Channel(function (input, output, go) {
        go.run(function* () {

            // if use event driven
            input.listen(function () {
                // take it in buffer
                // return true if take
                // return false if not take
            })

            var buffer = [];

            while (true) {

                // if ending! { break }

                // if empty
                yield go('take', function (result) {
                    buffer.push(result);
                    // check status
                })

                // if (full)
                yield go('put', buffer.shift(), function (result) {
                    // ...
                })

                // if ok to put or take

                var data = buffer.shift();
                yield go('select'
                    ['take', function (result) {
                        buffer.unshift(data);
                        // ..
                        // ..
                    }],
                    ['put', data, function (result) {

                    }]
                )
            }

            while (yield go('select',
                ['take', input, function (data) {

                }],
                ['put', output, data, function (result) {

                }]
            ));


        }, function (err) {
            input.close();
            output.close();
        })
    })
}
