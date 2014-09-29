
var Port = require('./port')
var assert = require('assert')
var Coroutine = require('./coroutine')
var transyDefaults = require('transy')._defaults

Object.keys(transyDefaults).forEach(function (name) {
    var fn = transyDefaults[name]
    exports[name] = function () {
        return transy(fn.apply(null, arguments))
    }
})

// run it immediately
function run(genFun, cb) {
    new Coroutine(genFun(), cb).next()
}

function transy(xform) {
    return function (input, output, go) {
        run(function* () {
            var list = []
            var finish = false
            var produce = xform(function (data, done) {
                if (done) {
                    finish = true
                } else {
                    list.push(data)
                }
                return finish
            })

            for (;;) {
                var obj = yield go('take', input)
                //console.log(obj)
                if (obj.done) {
                    // end of input
                    produce(obj.value, true)
                } else {
                    produce(obj.value)
                }
                for (var i = 0; i < list.length; i++) {
                    if (! (yield go('put', output, list[i]))) {
                        // if output closed
                        finish = true
                        break
                    }
                }
                list = []
                if (finish) {
                    break
                }
            }
        }, function (err) {
            input.close(err)
            output.close(err)
        })
    }
}

function buffer(maxSize, getSize) {
    getSize = getSize || function () { return 1 }

    return function (input, output, go) {
        run(function* () {

            var size = 0
            var buf = []
            var inputClosed = input.isClosed()
            var outputClosed = output.isClosed()
            var info = void 0

            function takeInput(result) {
                //console.log('take:', result)
                if (result.done) {
                    // cannot take from it anymore
                    inputClosed = true
                    info = result.value
                } else {
                    size += getSize(result.value)
                    buf.push(result.value)
                }
            }

            function putOutput(ok) {
                //console.log('put', buf[0], ok)
                if (ok) {
                    size -= getSize(buf[0])
                    buf.shift()
                } else {
                    // output is closed
                    outputClosed = true
                    info = output.getCloseMessage()
                }
            }

            for (;;) {
                if (outputClosed) {
                    info = output.getCloseMessage()
                    break;
                }
                if (inputClosed) {
                    if (buf.length === 0) {
                        info = input.getCloseMessage()
                        break
                    }
                    // I can only put to output
                    putOutput(yield go('put', output, buf[0]))
                    continue;
                }
                // I can only take an item
                if (buf.length === 0) {
                    takeInput(yield go('take', input))
                    continue
                }
                // I can take or put
                if (size < maxSize) {
                    // console.log('select!!!', buf[0])
                    yield go('select',
                        ['put', output, buf[0], putOutput],
                        ['take', input, takeInput]
                    )
                } else {
                    putOutput(yield go('put', output, buf[0]))
                }
            }
            buf = null;
            input.close(info);
            output.close(info);
        })
    }
}
exports.buffer = buffer

function through() {
    var fns = arguments
    assert(fns.length >= 1)
    return function (_input, _output, go) {
        var input, output;

        // output = _output
        // for (var i = fns.length-1; i > 0; i--) {
        //     input = new Port()
        //     fns[i](input, output, go)
        //     output = input
        // }
        // fns[0](_input, output, go)
        input = _input
        for (var i = 0; i < fns.length - 1; i++) {
            output = new Port()
            fns[i](input, output, go)
            input = output
        }
        fns[i](input, _output, go)
    }
}
exports.through = through

function pass(opts) {
    var autoClose = (opts && opts.autoClose) || true

    return function (input, output, go) {
        run(function* () {
            for (;;) {
                var data = yield go('take', input)
                if (data.done) {
                    output.close(data.value)
                    return
                } else {
                    if (!(yield go('put', output, data.value))) {
                        input.close()
                        return
                    }
                }
            }
        }, function (err) {
            // assert input is closed
            // assert output is closed
        })
    }
}
exports.pass = pass

// function mapAsyc(genFn) {
//     return function (input, output, go) {
//         run(function* () {
//             for (;;) {
//                 var data = yield go('take', input)
//                 if (data.done) {
//                     output.close(data.value)
//                     return
//                 } else {
//                     if (!(yield go('put', output, yield* genFn(data.value)))) {
//                         input.close()
//                         return
//                     }
//                 }
//             }
//         }, function (err) {
//             input.close(err)
//             output.close(err)
//         })
//     }
// }
// exports.mapAsync = mapAsync

// function filterAsync(genFn) {
//     return function (input, output, go) {
//         go.spa
//     }
// }

/*
Channel.fromEvent(event, 'error', 'close', 'abc')
    .each(function ({ type, data }) {
        switch (type) {
        case 'error':
            // ...
        case 'close':
            // ...
        case 'abc':
            // ...
        }
    })

Channel.fromEvent(event, 'data')

    .through(fs.openWrite())

    .through

Channel
    .through(openRead())

    .each(console.log)

    .done(x => console.log(x))
*/
function fromEvent(event, type) {
    return function (input, output, go) {
        // readonly
        input.close()

        event.on(type, function listener(data) {
            output.put(data).then(function (result) {
                // output closed
                if (!result) {
                    event.removeListener(type, listener)
                }
            })
        })
    }
}
exports.fromEvent = fromEvent
// pipeEvent

function chain(fn) {
    var ch = new Chain()
    fn.call(ch, ch)

    var fns = ch._chain
    ch._chain = null

    return through.apply(null, fns)
}
exports.chain = chain

function Chain() {
    this._chain = []
}

// at the end
Object.keys(exports).forEach(function (name) {
    var fn = exports[name]
    Chain.prototype[name] = function () {
        if (!this._chain) {
            throw new Error('cannot append outside of init function')
        }
        this._chain.push(fn.apply(this, arguments))
        return this
    }
})
