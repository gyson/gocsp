
'use strict'

module.exports = exports = go

var isGenFun = require('./util').isGenFun
var isThenable = require('./util').isThenable

exports.Port = require('./port')
exports.Channel = require('./channel')
exports.Promise = require('./promise')
exports.async = require('./coroutine').async


exportAll(require('./operation'))

function exportAll(obj) {
    Object.keys(obj).forEach(function (name) {
        exports[name] = obj[name]
    })
}

/*
support spawn, thunk, task
go(function* () {
    // magic go
    yield go(cb => fs.readFile('path', cb))

    yield go(cb => fs.openWrite())

    // yield (resolve, reject) => fs.exists('path', resolve)

    var file = new Promise(fs.readFile('abcdefg'))

    var file = yield fs.readFile('abcdefg')
})()
*/

function go(arg) {
    if (typeof arg === 'function') {
        if (isGenFun(arg)) {
            return go.async(arg)
        }
        if (arg.length === 1) {
            return go.thunk(arg)
        }
        if (arg.length === 2) {
            return go.task(arg)
        }
    }
    if (isThenable(arg)) {
        return go.await(arg)
    }
    throw TypeError('Invalid argument!')
}
