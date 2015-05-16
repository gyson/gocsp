'use strict';

module.exports = select

var Future = require('./future')

// Future.select(s
//     => s(chan.take(), function (cb, val) {
//
//     }, function (cb, err) { ... })
//     || s(chan.take(), function (cb, val) {
//
//     })
//     || s(Future.timeout(1000), function (cb) {
//     })
// )

// Future.future()

function Selector() {
    // some state...
}

function select(fn) {
    // var f = Future.raw(function () {
    //     // select...
    // })

    // Selector

    return new Future(function (cb) {
        // state
        var selector = new Selector()

        var e = tryCatch(fn, s)

        if (e && !selected) {
            selected = true
            for (var i = 0, len = futures.length; i < len; i++) {
                futures[i].cancel(e)
            }
            cb(e)
        }

        function s(obj, onResolved, onRejected) {
            var future = Future.from(obj)
            if (s.selected) {
                future.cancel()
                return s.selected
            }
            future._listen(trySelect, selector, onResolve, onRejected)
            // futures.push(future)
            // future.done(function (err, val) {
            //     if (selected) { return }
            //     selected = true
            //     for (var i = 0, len = futures.length; i < len; i++) {
            //         futures[i].cancel(e)
            //     }
            //     if (typeof handler === 'function') {
            //         handler(cb, err, val)
            //     } else {
            //         cb(err, val)
            //     }
            // }, cb)
            if (!s.selected) {
                s.futures.push(future)
            }
            return selected
        }
    })
}

function tryCatch(fn, s) {
    try { fn.call(s, s) } catch (e) { return e || new Error() }
}
