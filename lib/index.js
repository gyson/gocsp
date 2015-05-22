'use strict';

var Promise = require('bluebird')

var chan = require('./chan')
var select = require('./select')

exports.chan = chan
exports.select = select

function take(ch) {
    return new Promise(function (resolve) {
        ch._take(resolve)
    })
}
exports.take = take

function put(ch, val) {
    return new Promise(function (resolve) {
        ch._put(val, resolve)
    })
}
exports.put = put

function close(ch, val) {
    return ch._close(val)
}
exports.close = close

//
// for (var val on csp.observe(ch)) { ... }
//
// csp.observe = function (ch) {}
//

//
// csp.reduce(ch, init, function (prev, next) {
//
// }, function (prev, result) {
//
// })
//
// TODO: dont use generator function
//
var reduce = Promise.coroutine(function* (ch, init, reduceFn, endFn) {
    var result, acc = init
    while (result = yield take(ch), !result.done) {
        var ret = fn(acc, result.value)
        if (ret && typeof ret.then === 'function') {
            acc = yield ret
        } else {
            acc = ret
        }
    }
    return endFn ? endFn(acc, result.value) : acc
})
exports.reduce = reduce

//
// each(ch, function (val) {
//
// }, function () {
//
// })
//
// TODO: dont use generator function
//
var each = Promise.coroutine(function* (ch, eachFn, endFn) {
    var result, ret
    while (result = yield take(ch), !result.done) {
        var ret = eachFn(result.value)
        if (ret && typeof ret.then === 'function') {
            yield ret
        }
    }
    if (endFn) {
        ret = endFn(result.value)
        if (ret && typeof ret.then === 'function') {
            yield ret
        }
    }
})
exports.each = each

function timeout(time, fn) {
    return new Promise(function (resolve, reject) {
        if (fn) {
            setTimeout(function () {
                try {
                    resolve(fn())
                } catch (e) {
                    reject(e)
                }
            }, time)
        } else {
            setTimeout(resolve, time)
        }
    })
}
exports.timeout = timeout
