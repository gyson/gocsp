'use strict';

module.exports = exports = listen

// var thunk = require('./thunk')

// var Future = require('')
var Future = require('./future')
var Channel = require('./channel')

// listen()      => channel
// listen.once() => future

// listen(http.request, 'request') one ? multiple ?
// event to channel ?
function listen(event, type, opts) {
    //
    // return a channel ?
}

// onError ? true or false
function once(event, type, opts) { // opts: onError: onError ?
    var listener, remove = function () {
        event.removeListner(listener)
    }
    return new Future(function (cb) {
        event.on(type, listener = function (data) {
            remove()
            if (opts && opts.all) {
                cb(null, Array.prototype.slice.call(arguments))
            } else {
                cb(null, data)
            }
        })
    }, remove)
}
exports.once = once

// listenOnce()

// s.once(event, 'type', function (val) {
//
// })

csp.listen() // => return promise
csp.listenOnce() // => promise, keep listen until it's something cool

// listen.once

// exports.listen

// => return a thunk
// listen.once(event, type) {
//
// }

ch.through(mapAsync(async function (x) {

}))

ch.through(mapCallback(function (x, cb) {

}))

// ch.through(expandCallback(function (x, iterator) {
//     iterator.next(x)
//     iterator.return()
//     itertor.throw()
// }))
// ch.through(map) // iterator.next(value) .throw .return

{
    next() {

    },
    throw() {

    },
    return() {

    }
}

// => for pipe
// listen(event, type, options)
// pipe(p => p
//     .use(listen, event, type)
//     .each(function () {
//
//     })
// )
// pipe(p => p.use(listen, event, type, options).each())

// pipe.channel(p => p
    // .use(listen, event, type))
    // .map()

// for browser
// element.attachEvent
// element.addEventListenr
// element.removeEventListener
// s(once(el, 'onclick'), function () {
//
// })
