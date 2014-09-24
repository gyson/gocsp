
// probably will move this to gocsp-fs
// when gocsp itself is stable

var fs = require('fs')

function openRead(path, opts) {

    opts = opts || {}
    var mode = opts.mode || 438 /*=0666*/
    var flags = opts.flags || 'r'
    var autoClose = opts.autoClose || true

    return function (input, output, go) {
        // readonly ?
        input.close()

        var fd = null
        var closed = false
        function close(err) {
            if (closed) return;
            closed = true
            output.close(err)
        }

        go.spawn(function* () {
            // open
            fd = yield go('thunk', function (cb) {
                fs.open(path, flags, mode, cb)
            })

            // // stat
            // var stat = yield go('thunk', function (cb) {
            //     fs.fstat(fd, cb)
            // })

            // var size = stat.size

            var chunkSize = 8 * 1024;

            // kernel lies about files
            // go ahead and try read some
            // if (size === 0) {
            //
            // } else {
            //     // deside chunk size !
            // }

            do {
                var buffer = new Buffer(chunkSize)

                var bytesRead = yield go('thunk', function (cb) {
                    fs.read(fd, buffer, 0, chunkSize, -1, cb)
                })

                console.log('buffer:', buffer)
                console.log(bytesRead)
                if (bytesRead === 0) {
                    // done reading!
                    break
                }
                if (bytesRead < chunkSize) {
                    buffer = buffer.slice(0, bytesRead)
                }
            } while (yield go('put', output, buffer))

        }, function (err) {
            if (err) {
                close(err)
            }
            if (fd !== null) {
                fs.close(fd, close)
            }
        })
    }
}
exports.openRead = openRead

function openWrite(path, opts) {
    // check input
    opts = opts || {}
    var mode = opts.mode || 438 /*=0666*/
    var flags = opts.flags || 'w'

    return function (input, output, go) {
        var fd = null

        var closed = false
        function close(err) {
            if (closed) return;
            closed = true
            input.close(err)
            output.close(err)
        }

        go.spawn(function* () {
            fd = yield go('thunk', function (cb) {
                fs.open(path, flags, mode, cb)
            })

            var pos = 0;
            var res = yield go('take', input)
            var data = res.value

            while (!res.done) {
                pos += yield go('thunk', function (cb) {
                    fs.write(fd, data, 0, data.length, pos, cb)
                })
                res = yield go('take', input)
                data = res.value
            }
            return data

        }, function (err) {
            if (err) {
                close(err)
            }
            if (fd !== null) {
                fs.close(fd, close)
            }
        })
    }
}
exports.openWrite = openWrite

function openAppend(path, opts) {
    opts = opts || {}
    opts.flags = 'a'
    return openWrite(path, opts)
}
exports.openAppend = openAppend
