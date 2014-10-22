
'use strict'

exports.co = require('gocsp-co')
exports.select = require('gocsp-select')
exports.Channel = require('gocsp-channel')

var thunk = exports.thunk = require('gocsp-thunk')

exports.take = function (chan) {
    return thunk(function (cb) {
        chan.take(function (res) {
            cb(null, res)
        })
    })
}

exports.put = function (chan, value) {
    return thunk(function (cb) {
        chan.put(value, function (res) {
            cb(null, res)
        })
    })
}
