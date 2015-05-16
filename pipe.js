'use strict';

module.exports = exports = pipe

var go = require('./go')
var Future = require('./future')
var Channel = require('./channel')

var reducers = require('transy/reducers')
var transformers = require('transy/transformers')

// function (cb, input, output) {
//     // ...
// }

// .reduce({
//     value: 123,
//     step: function (prev, next) {
//
//     },
//     end: function (res) {
//         return res
//     }
// })

// pipe(src, dest, p => p
//     .through()
//     .through()
//     .through()
// )

app.use(function (next) {
    return function (req, res) {
        // ...
    }
})

yield pipe(p => p.from(req).join(''))

yield pipe(p => p
    .from(request.stream)
    .through(chan or transform stream)
    .through(transy)
    .to(response.stream)
)

// js-parse-body/json
// js-parse-body/string
// js-parse-body/buffer
// body/json
// body/string
// body/buffer
// body.json(req)
// body.string(req)
// body.buffer(req)

// function (next) {
//     return function (req, res) {
//         // ...
//         // ...
//         yield next(req, res)
//     }
// }

// send response now
send(request).then(function () {

})

// takeUntil(new Promise(function () {
//
// }))

takeUntil(timeout())

each(ch, async function (value) {

})
// to end, close ch if any error

// pipe(p => p
//     .from(src).to(dest)
//     .through()
//     .through()
//     .through()
// )

// pipe(src)
//     .through()
//     .through()
//     .through()
//     .through()

// pipe(src).to(dest)

// pipe(p => p
//     .from([1, 2, 3, 4]) // .to(dest)
//     .mapAsync(go.compose(
//         coffee(),
//         okkkkk(),
//         loveee()
//     ))
// )
// pipe(p => {
// core:
//     p.from()
//     p.through()
//     p.to()
//     p.reduce()
//
// util:
//     p.map
//     p.mapAsync
//     p.filter
//     p.filterAsync
//     p.expand
//     p.expandAsync
//     p.each
//     p.eachAsync
//     p.done
//     p.doneAsync // done ?
//     p.take
//     p.takeWhile
//     p.takeWhileAsync // async...
//     p.drop
//     p.dropWhile
//     p.dropWhileAsync
//     p.split
//     p.compose
// }, options)

function pipe(fn, opts) {
    return thunk(function (done) {
        var p = new Piper(opts)
        fn.call(p, p)
        // if is not end
        if (!p._end) {
            // noop
            p.reduce(undefined, function (r, v) {
                return r
            })
        }
        p.done()(done)
    })
}

function Piper() {
    this._start = false
    this._end = false
    this._list = []
}

// .from(readable_stream)
// .from(readable_channel)
// .from(function (output) { ... })
// .from(iterable) : array or iterable
Piper.prototype.from = function () {
    if (this._start) {
        throw new Error()
    }
    this._start = true

    return this
}

pipe(p => p
    .from(fs.src())
    .through()
    .through()
    .through()
    .through(fs.dest())
    .to(fs.dest())
)

fs.dest = function (input, output) {
    // if arguments.length === 1, it's to
    // if arguemnts.length === 2, it's through
}

// .through(duplex_stream)
// .through(channel)
// .through(function (input, output) { ... })
Piper.prototype.through = function () {

    return this
}

// .to(writable_stream)
// .to(writable_channel)
// .to(function (input) { ... })
Piper.prototype.to = function () {

}

// add other transformers
Object.keys(transformers).forEach(function (name) {
    var fn = transformers[name]
    Piper.prototype[name] = function () {
        return this.compose(fn.apply(undefined, arguments))
    }
})

// override
Piper.prototype.compose = function () {
    // this._start && !this._end
    // ...
}

Object.keys(reducers).forEach(function (name) {
    var fn = reducers[name]
    Piper.prototype[name] = function () {
        return this.reduce(fn.apply(undefined, arguments))
    }
})

Piper.prototype.reduce = function () {
    // this._start && !this._end
    if (this._end) {
        throw new Error()
    }
    this._end = true

    // ...
}

// for plugin
// .use(p => p) // plug in system
Piper.prototype.use = function (fn) {
    var args = new Array(arguments.length)
    args[0] = this
    for (var i = 1; i < arguments.length; i++) {
        args[i] = arguments[i]
    }
    fn.apply(undefined, args)
    return this
}

// toChannel()
// chan.toChannel()
// chan.toReadable()
// chan.toWritable()

// socket.reader
// socket.writer
// pipe(p => {
// .use(socket.reader.take())
// .use(socket.writer.write())
//     socket.reading(p)
//     socket.writing(p)
// })
//
// .read
// .write
// .done
// .cancel
// .abort

// .read
// .write
// socket.readAll(p)
// socket.writeAll(p)

// p.through(coffee)
// p.pipe(coffee) // => coffee(p, a, b, c, d)

// pipe(p, a, b, c) //
// function () {
//
// }
// if it return a promise, thunk or generator function...

// .flush(v => console.log('done'))

// .through(function (input, output) {
    // ...
    // ...
// })
// .use(fs.src, 'build/path')
// .use(fs.dest, 'build/path')

// .from(function* (input) {
//
// })
// .through(function* (input, output) {
//
// })
// .to(function* (output) {
//
// })

// p.from(function (w, done) {
//     pipe(p => {
//         // ..
//         p.to(w)
//     })(done)
// })



// locker, when it's locked, not be able to access it
// pipe(p => {
//     p.from(fs.createReadStream())
//     p.to(fs.createWriteStream())
// })

// RawSocket() // only be able to get from link
// no data should go through js thread
// all go through c native thread
// I guess native socket / file descripter is
// a similar abstraction.

// when main thread should not hit when do so...
// https://github.com/whatwg/streams/issues/97

// function pipe(fn) {
//     var p = new Piper()
//     if (isGeneratorFunction(fn)) {
//         go(fn(p))(function (err, val) {
//             if (err) {
//                 p.throw(err)
//             } else {
//                 p.end()
//             }
//         })
//     } else {
//         try {
//             fn(p)
//             p.end()
//         } catch (e) {
//             p.throw(e)
//         }
//     }
//     return p.done()
// }
// exports.pipe = pipe

// pipe(p => p.from(src).to(dest))

// pipe(coffee, function () {
//     // ...
//     // ...
// })

// p.from(readable_stream)
// p.from(channel)
// p.from(function (put, close, abort, done) { ... })
Piper.prototype.from = function (obj, opts) {
    // assert(this._open)
    // readable stream
    if (isReadableStream(obj)) {
        // wrap as function
    }

    // p.from(function (done, chan) { ... })
    if (typeof obj === 'function') {
        // pipe
        if (obj.length === 1) {
            // new Piper(...)
            // tail with...
            // p.add...
            // p.init()
        }
    }

    // channel
    if (Channel.isChannel(obj)) {

    }
    throw new TypeError('from pipe.prototype.from: '
                + obj + ' is not readable or channel')
}

// init
// .readable(obj, done)
// .writable(obj, done)
// .duplex(input, output, done)
// .done
// { readable }
// p.through(duplex_stream)
// p.through(channel)
// p.through(function (input, output, done) { ... })
Piper.prototype.through = function (obj, opts) {
    // assert(this._open)
    // duplex stream
    if (obj.writable) {
        // add as stream
        // wrap as function
    }
    // .through(function (done, input, output) { ... })
    if (typeof obj === 'function') {
        // obj(this)
        return
    }
    // channel
    if (isChannel(obj)) {
        // ...
    }
    throw new TypeError('from pipe.through: '
                + obj + ' is not pipe, duplex or channel')
}

// p.to(writable_stream)
// p.to(channel)
// p.to(function (done, input) { ... })
Piper.prototype.to = function (obj, opts) {
    // assert(this._open)
    // stream
    if (obj.writable) {
        // wrap as that...
        // obj = wrapWritable(obj)
    }
    if (typeof obj === 'function') {
        // function (done, w) {...}
    }
    // channel
    if (isChannel(obj)) {

    }
    throw new TypeError('from pipe.to: '
                + obj + ' is not pipe, writable or channel')
}

// pipe plugin .use
Piper.prototype.use = function (fn, a, b) {
    if (typeof fn !== 'function') {
        throw new TypeError(fn + 'is not function, use(fn, ...)')
    }
    var args = new Array(arguments.length)
    args[0] = this
    for (var i = 1; i < arguments.length; i++) {
        args[i] = arguments[i]
    }
    fn.apply(void 0, args)
}

// p.from(fs.reading('file'))
// p.to(fs.writing('file', { encoding: 'utf8' }))

// p.from(fs.read('path/to/file'))
// p.to(fs.write('path/to/dest'))

// new Channel.Readable(function (w, done) {
//     w.write() // ...
//     w.close()
//     w.abort()
//     // w.lock('secret')
//     // w.unlock('secret')
//     go(function* () {
//
//     })(done)
// })

// p.from(fs.read('path/to/file.txt'))

// p.fromWritable
// p.fromReadable
// p.fromDuplex

// chan.readable()
// chan.writable()

// .readable(socket)
// .writable()

// .reading
// .writing
// .readable(input)
// .writable()
// function (input, output) {
//
// }

// new Channel.Writable(function (r, done) {
//     r.read()   // ...
//     r.cancel()
// })
//
// new Channel.Duplex(function (r, w, done) {
//
// })

// p.from(fs.read('path/to/abc'))
// p.through(fs.compress('zlib...'))
// p.to(fs.write('path/to/efgg'))

// state: end, destroyed
// stop piper...
// Piper.prototype.end = function () {
//     if (this._isEnd) { return }
//     this._closed = true
//     // ...
//     // ...
//     // get all stream to work with each other
//     // this._list
//     // if error...
// }

// Piper.prototype.throw = function () {
//     if (this._destroyed)
// }


// Piper.prototype.mapAsync = function () {
//
// }
// for pipey
// mapAsync filterAsync expandAsync eachAsync
// takeWhileAsync dropWhileAsync
// Object.keys(P).forEach(function (name) {
//     var fn = P[name]
//     Piper.prototype[name] = function () {
//         this.through(fn.apply(this, arguments))
//     }
// })

// use transduce ?
// transduce
Piper.prototype.reduce = function (fn, init) {
    // end stream...
    // if not fn, then ...
    // new Reducer(fn, init)
}


// .to
// .reduce()
// pipe(p => p
//     .from()
// )

// pipe(p => p
//     .from(fs.createReadStream())
//     .through(compress)
//     .through(stream.split('\n'))
//     .through(stream.split('\n'))
//     .use(coffee)
//     .use(abcdefg)
//     .mapAsync()
//     .to(fs.createWriteStream())
// )

// yield pipe(p => p.from(src).map().filter().reduce())

// .through(input, output)

// var r.get('path/to/something', function (req, res) {
//
// })

// pipe(p => p.from(src).compose(xform).to(dest))

// pipe.wrap(p => p.compose(xform))(input, output)

// go.wrap(fn)(input, output)
// .through(function (input, output) {
    // return thunk()
// })
// pipe.chain(c => c
//     .through()
//     .through()
//     .through()
// )(input, output)(function (err, val) {
//
// })

// error ?
// http.listen({
//     port: 1000,
//     accept: go.wrap(function (req) {
        // try {
        //     // ...
        //     // if (xxx.xxx = xxx)
        // } catch (e) {
        //     // handle error ...
        // }
        // doSomething(auth)
//     }),
//     error: function (error) {
//         // ...
//     }
// }) // error port ... for errors

// http.listen({
//     port: 1000,
//     accept: function* (req) {
//
//     }
// })(function (err, val) {
//     // stopped
// })

// pipe(p => p
//     .use(http.listen, { port: 8080 })
//     .each(function (req) {
//         // ,,,
//     })
// )

// pipe(p => p
//     .from(fs.createReadStream())
//     .split('\n')
//     .map(str => str + ' okk')
//     .each(console.log)
//     .to(fs.createWriteStream())
// )

// .mapAsync(go.compose(
//     abc,
//     efg,
//     okk
// ))

// function return thunk or promise
// function (next) {
//     return function* (req) {
//         yield next(req)
//
//     }
// }

// .use(function (next) {
//     return function* (req) {
//         return yield next(req)
//     }
// })

// function (next) {
//     return function (req) {
//         // route match...
//         if (somework) {
//             // do something
//             // ......
//         } else {
//             return next(req)
//         }
//     }
// }

// function (xf) {
//     return {
//         step: function* (req) {
//             yield xf.step(res, res)
//         }
//     }
// }

// wrap(function* abc() {
//
// }, ctx)

// function* () {
//
// }


// function (xf) {
//     return function* (res, val, reduced) {
//         if (reduced === yield xf.step(res, val)) {
//             return reduced
//         }
//     }
// }

// accept: req => req
//     .use(abcd)
//     .use(something)
//     .use(something)
//     .use(something)
//     .use(something)
//     .use(something)

// ... overhead should be small
Piper.prototype.eachAsync = function (fn) {
    // assert fn is genrator function
    // p.input  -> input channel
    // p.output -> output channel
    // p.error  -> error channel
    // p.error.put(new Error())

    // p.error => p.error.put()
    var f = go.wrap(fn)

    return this.through(function* (input, output) {

        var res = yield input.take()

        if (res.done) {
            yield input.done() // if error, then error will forwrad to output
            output.close()
            return
        }

        yield f(res.value)

        yield output.put(res.value)
    })
    // return this.through(function (input, output, defer) {
    //     var done = defer()
    //     go(function* () {
    //         var val = (yield input.take()).value // if done...
    //         yield* fn((yield input.take()).value)
    //         yield output.put()
    //     })(done)
    // })
}
Piper.prototype.mapAsync = function (fn) {
    // fn is generator function
    return this.through(function (input, output) {

    })
}

Piper.prototype.filterAsync = function (fn) {
    return this.through(function (input, output) {

    })
}

// expandAsync(function* () {
//     yield something()
//     return [1, 2, 3, 4, 5, 6]
// })

Piper.prototype.expandAsync = function (fn) {
    var f = go.wrap(fn)
    return this.through(function* (input, output) {
        //
        // take one
        yield abc.put()

        var iter = f(v)

        // assert iter is iterable

        // if iter is array
        // if iter is iterator
        // if iter is iterable
        // ...
        // if it's a channel
        // if it's a stream

        yield output.put(val)

        // if any exception, will close input and output with error info

    })
}

// .eachAsync(fn, { parallel: 10 }) // limit(5)
// Piper.prototype.takeWhileAsync
// Piper.prototype.dropWhileAsync

// mapAsync(stream to stream)
// mapAsync(channel to stream)
// mapAsync(stream to channel)
// mapAsync(channel to channel)

// stream to stream
// function pipeStreamToStream(src, dest, opts) {
//     src.pipe(dest) // opts
// }
// // stream to channel
// function pipeStreamToChannel(src, dest, opts) {
//     // src.on('data')
//     // use through2 ??
//     // destroy stream ?
//     // .on .pause .resume ?
// }
// // channel to stream
// function pipeChannelToStream(src, dest, opts) {
//     src.take()(function () {
//         // callabck ...
//     })
// }

// .use(require('pipy-coffee'))
// .use(require('pipy-uglify'))

// channel to channel
function pipeChannelToChannel(src, dest, opts) {
    src.take()(take)
    function take(err, res) {
        if (err) {
            dest.abort(err)
        } else {
            if (res.done) {
                dest.close(res.value)
            } else {
                dest.put(res.value)(put)
            }
        }
    }
    function put(err, ok) {
        if (err) {
            src.cancel(err)
        } else {
            if (ok) {
                src.take()(take)
            } else {
                src.cancel() // early termination
            }
        }
    }
}

function isReadableStream(obj) {
    return obj && obj.readable
}

function isWritableStream(obj) {
    return obj && obj.writable
}
