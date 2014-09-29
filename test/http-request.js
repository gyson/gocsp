
var go = require('../lib/index')
var http = require('../lib/http')

var req = new go.Channel(http.request('http://localhost:8080'))

req.close()

req.each(console.log).done()
