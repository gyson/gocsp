'use strict';

module.exports = select

var Future = require('./future')

// Future.select(s
//     => s(chan.take(), function (cb, err, val) {
//
//     })
//     || s(chan.take(), function (cb, err, val) {
//
//     })
//     || s(Future.timeout(1000), function (cb) {
//         cb(new Error('timeout'))
//     })
// )

// s.resolve(new Promise())
// s.reject
// s.take(ch, function (val) {
//
// })
//
// s.put(ch, val, function (ok) {
//
// })
//
// s.timeout(100, function () {
//
// })

csp.select(s => {


    // ...
    s.resolve(new Promise(function (resolve, reject) {
        // cancell all channel operation
        //
    }))
    //
    // s.reject(new Error())

    // s.resolve()

    s.resolve(abc) // if
    // cancel all operation
    s.resolve(timeout(1000))

    // s.define(function (cb) {
    //
    // }, function onCancel() {
    //
    // })
})

// listenOnce() // =>ch.take() => close now


function select(fn) {
    return new Future(function (cb) {
        // state
        var selected = false
        var futures = []

        var e = tryCatch(fn, s)

        if (e && !selected) {
            selected = true
            for (var i = 0, len = futures.length; i < len; i++) {
                futures[i].cancel(e)
            }
            cb(e)
        }

        function s(obj, handler) {
            var future = Future.from(obj)
            if (s.selected) {
                future.cancel()
                return s.selected
            }
            futures.push(future)
            future.done(function (err, val) {
                if (selected) { return }
                selected = true
                for (var i = 0, len = futures.length; i < len; i++) {
                    futures[i].cancel(e)
                }
                if (typeof handler === 'function') {
                    handler(cb, err, val)
                } else {
                    cb(err, val)
                }
            }, cb)
            return selected
        }
    })
}

function tryCatch(fn, s) {
    try { fn.call(s, s) } catch (e) { return e || new Error() }
}
