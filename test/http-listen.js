
var go = require('../lib/index')
var http = require('../lib/http')

new go.Channel(http.listen(8080))
    .each(function (conn) {
        console.log('new connection')
    })
    .done()
