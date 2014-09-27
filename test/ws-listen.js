
var ws = require('../lib/ws')
var go = require('../lib/index')

new go.Channel(ws.listen(8000))
    .each(function (conn) {
        console.log("get new connection")

        conn.pipe(process.stdout)
    })
    .done()
