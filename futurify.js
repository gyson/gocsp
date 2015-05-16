'use strict';

module.exports = exports = futurify

var Future = require('./future')

function futurify(fn, ctx) {
    if (typeof fn !== 'function') {
        throw new TypeError(fn + ' is not function')
    }
    if (ctx === undefined) {
        return function (a, b, c, d) {
            var f = Future.raw()
            var cb = function (err, val) {
                f._fill(err, val)
            }
            var len = arguments.length
            try {
                switch (len) {
                case 1: fn(a, cb);          return f
                case 2: fn(a, b, cb);       return f
                case 0: fn(cb);             return f
                case 3: fn(a, b, c, cb);    return f
                case 4: fn(a, b, c, d, cb); return f
                default:
                    var args = new Array(len + 1)
                    for (var i = 0; i < len; i++) {
                        args[i] = arguments[i]
                    }
                    fn.apply(undefined, args)
                    return f
                }
            } catch (e) {
                cb(e)
                return f
            }
        }
    } else {
        return function (a, b, c, d) {
            var f = Future.raw()
            var cb = function (err, val) {
                f._fill(err, val)
            }
            var len = arguments.length
            try {
                switch (len) {
                case 1: fn.call(ctx, a, cb);          return f
                case 2: fn.call(ctx, a, b, cb);       return f
                case 0: fn.call(ctx, cb);             return f
                case 3: fn.call(ctx, a, b, c, cb);    return f
                case 4: fn.call(ctx, a, b, c, d, cb); return f
                default:
                    var args = new Array(len + 1)
                    for (var i = 0; i < len; i++) {
                        args[i] = arguments[i]
                    }
                    fn.apply(ctx, args)
                    return f
                }
            } catch (e) {
                cb(e)
                return f
            }
        }
    }
}
Future.futurify = futurify

// e.g. fs / redis
// use Proxy would be slow ?
function futurifyAll(obj) {
    var ret = {} // $add()
    for (var name in obj) {
        if (typeof obj[name] === 'function') {
            ret[name] = futurify(obj[name], obj)
        }
    }
    return ret
}
exports.all = futurifyAll
