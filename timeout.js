'use strict';

module.exports = exports = timeout

var Future = require('./future')

// timeout(1000) // => return ok
function timeout(time) {
    var ref
    return new Future(function (cb) {
        if (time !== +time) {
            throw new TypeError(time + ' is not a number')
        }
        ref = setTimeout(cb, time)
    }, function () {
        if (ref) {
            clearTimeout(ref)
        }
    })
}
