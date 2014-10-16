
var go = require('./index')
var Port = require('./port')
var assert = require('assert')
var transyDefaults = require('transy')._defaults


Object.keys(transyDefaults).forEach(function (name) {
    var fn = transyDefaults[name]
    exports[name] = function () {
        return transy(fn.apply(null, arguments))
    }
})

function transy(xform) {
    return function (input, output) {
        go(function* () {
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
                var obj = yield go.take(input)
                //console.log(obj)
                if (obj.done) {
                    // end of input
                    produce(obj.value, true)
                } else {
                    produce(obj.value)
                }
                for (var i = 0; i < list.length; i++) {
                    if (! (yield go.put(output, list[i]))) {
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
        })()
        // }, function (err) {
        //     input.close(err)
        //     output.close(err)
        // })
    }
}


// through array [x, y, z]
function through(fns) {
    assert(fns.length >= 1)
    return function (input, output) {
        for (var i = 0; i < fns.length - 1; i++) {
            fns[i](input, input = new Port())
        }
        fns[i](input, output)
    }
}
exports.through = through

function pass(opts) {
    var autoClose = (opts && opts.autoClose) || true
    var autoThrow = (opts && opts.autoThrow) || true
    return function (input, output) {
        go(function* () {
            for (;;) {
                var data = yield go.take(input)
                if (data.done) {
                    output.close(data.value)
                    return
                } else {
                    if (!(yield go.put(output, data.value))) {
                        input.close()
                        return
                    }
                }
            }
        })()
    }
}
exports.pass = pass


/* API:

buffer({ size: 10, type: 'Buffer' })

buffer({ size: 10, type: 'utf8' })

buffer({ size: 10, type: 'string' })

buffer({ size: 10, getSize: Buffer.byteLength })

*/

//
// exports.buffer =

// var go = require('../in')

// { size: 10, getSize:  }
// limit, measure
function buffer(opts) {
    var maxSize = opts.maxSize
    var getSize = opts.getSize || function () { return 1 }

    return function (input, output) {
        go(function* () {

            var size = 0
            var buf = []
            var inputClosed = input.isDone()
            var outputClosed = output.isDone()
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
                    info = output.getMessage()
                }
            }

            for (;;) {
                if (outputClosed) {
                    info = output.getMessage()
                    break;
                }
                if (inputClosed) {
                    if (buf.length === 0) {
                        info = input.getMessage()
                        break
                    }
                    // I can only put to output
                    putOutput(yield go.put(output, buf[0]))
                    continue;
                }
                // I can only take an item
                if (buf.length === 0) {
                    takeInput(yield go.take(input))
                    continue
                }
                // I can take or put
                if (size < maxSize) {
                    // console.log('select!!!', buf[0])
                    yield go.select(function (s) {s
                        .put(output, buf[0], putOutput)
                        .take(input, takeInput)
                    })
                } else {
                    putOutput(yield go.put(output, buf[0]))
                }
            }
            buf = null;
            input.close(info);
            output.close(info);
        })()
    }
}
exports.buffer = buffer

// function mapAsyc(genFn) {
//     return function (input, output, go) {
//         run(function* () {
//             for (;;) {
//                 var data = yield go.take(input)
//                 if (data.done) {
//                     output.close(data.value)
//                     return
//                 } else {
//                     if (!(yield go.put(output, yield* genFn(data.value)))) {
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
*/
function fromEvent(event, type) {
    return function (input, output) {
        // readonly
        input.close()

        function handler(result) {
            if (!result) {
                event.removeListener(type, listener)
            }
        }

        function listener(data) {
            output.put(data).then(handler)
        }

        event.on(type, listener)
    }
}
exports.fromEvent = fromEvent

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
