
// map create a repository named gocsp-http ?
// and move this to it ?

var http = require('http')

// server
function listen() {
    var args = arguments
    return function (input, output, go) {
        var server = http.createServer(function (req, res) {
            output.put({
                request: req,
                response: res
            })
        })
        server.listen.apply(server, args)
    }
}
exports.listen = listen

// Channel.through(
//     http.get('....'),
//     // function (input, output, go) {
//     //     var res
//     //     while (res = yield go('take', input), !res.done) {
//     //         do something
//     //         okkkk
//     //         yield go('put', output, res.value)
//     //     }
//     // },
//     // zlib.gzip(),
//     http.put('....')
// )


//
// // throw exception if failed
// var err = yield go('through',
//     fs.openRead(),
//     fs.openWrite(),
// )
// if (err) { /* handle exception here */ }
// // pass err back

function request(options) {
    var args = arguments;
    return function (input, output, go) {
        var req = http.request(options, function (res) {

            // options has encoding
            res.setEncoding('utf8')
            res.on('data', function (data) {
                output.put(data)
            })
        })

        req.on('error', function () {
            console.log('err')
        })

        go.spawn(function* () {
            for (;;) {
                var data = yield go('take', input)
                if (data.done) {
                    req.end()
                    break;
                } else {
                    req.write(data.value)
                }

            }
        })

    }
}
exports.request = request

function get(options) {
    return request(options)
}
exports.get = get
