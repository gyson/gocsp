'use strict';

var Promise = require('bluebird')

// csp.async = Promise.coroutine

csp.take = function (ch) {
    return new Promise(function (resolve) {
        ch._take(resolve)
    })
}

csp.put = function (ch, val) {
    return new Promise(function (resolve) {
        ch._put(val, resolve)
    })
}

//
// say no to many things...
// simple primitive for message communication
//
csp.select = function (fn) {
    return new Promise(function (resolve, reject) {

        // ...
        // ...
        // ...

    })
}

csp.wait = function (ch, fn) {
    return new Promise(function () {

    })
}

// for (var val on csp.observe(ch)) { ...}
csp.observe = function (ch) {

}

// csp.each(ch, function (val) { ... })
csp.each = function (ch, fn) {
    // return new Promise(function () {
    //
    // })
} // resolve to close message ?

// csp.reduce(ch, function () { ... })
// csp.transduce(ch, compose(xxx), init) // => Promise

// csp.transduce(ch, map, map, reduce...)
csp.transduce = function (ch, transducer) {
    // use ... use ... ...
}

csp.timeout = function (time) {
    return new Promise(function (resolve) {
        setTimeout(resolve, time)
    })
}

// csp.readable(ch) // => return a read port // it's only readable
// csp.writable(ch) //

// listen
// listenOnce() // => promise

csp.interval = function () {
    var ch = new Channel()

    setInterval(function () {
        ch._put(val, noop)
    })

    ch._wait(function () {
        // set // clear interval
    })

    return ch
}
