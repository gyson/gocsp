
var ws = require('../lib/ws')
var go = require('../lib/index')

var conn = new go.Channel(ws.connect('ws://localhost:8000'))

process.stdin.pipe(conn)
