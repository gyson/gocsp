
var WebSocket = require('ws')
var WebSocketServer = require('ws').Server

// WebSocket.CONNECTING, WebSocket.OPEN, WebSocket.CLOSING, WebSocket.CLOSED

// client
// connect('ws://www.host.com/path')
// connect(new WebSocket('...'))
function connect(addr, opts) {
    // check info
    return function (input, output, go) {

        var ws = addr instanceof WebSocket
               ? addr
               : new WebSocket(addr, opts)

        function close(err) {
            input.close(err)
            output.close(err)
            ws.close()
        }

        ws.on('message', function (data) {
            output.put(data)
        })

        ws.on('error', close)
        ws.on('close', close)

        go.spawn(function* () {
            if (ws.readyState === WebSocket.CONNECTING) {
                yield go('once', ws, 'open', 'error', 'close') // change API ?
            }
            for (;;) {
                var data = yield go('take', input)
                if (data.done) {
                    close(data.value)
                    break;
                } else {
                    ws.send(data.value, function (err) {
                        if (err) close(err)
                    })
                }
            }
        })
    }
}
exports.connect = connect

// server
function listen(port) {

    return function (input, output, go) {
        var wss = new WebSocketServer({ port: port })

        wss.on('connection', function (ws) {
            //...
            //new Channel(wrap(ws, true))
            output.put(new go.Channel(connect(ws)))
        })

        wss.on('error', function (err) {
            output.close(err)
        })

        // wss.on('headers')
    }
}
exports.listen = listen
