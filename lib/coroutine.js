
'use strict'

var Promise = require('./promise')
var isGenFun = require('./util').isGenFun

function async(genFun) {
    if (!isGenFun(genFun)) {
        throw new TypeError(genFun + ' must be generator function')
    }
    return function () {
        var gen = genFun.apply(this, arguments)
        return new Promise(function (resolve, reject) {
            run(gen, resolve, reject)
        })
    }
}
exports.async = async

// run immediately
function run(gen, resolve, reject) {
    var done = false
    next()
    function next(object, isError) {
        try {
            execute(object, isError)
        } catch (err) {
            if (!done) {
                done = true
                reject(err)
            }
        }
    }
    function raise(error) { next(error, true) }

    function execute(object, isError) {
        var result, value, isSync, ready
        for (;;) {
            result = gen[isError ? 'throw' : 'next'](object)
            value = result.value

            if (result.done) {
                if (!done) {
                    done = true
                    resolve(value)
                }
                return
            }

            // it's promise
            if (value && typeof value.then === 'function') {
                value.then(next, raise)
                return
            }

            if (typeof value === 'function') {
                isSync = true
                ready = false
                try {
                    if (value.length === 2) {
                        value(function (val) {
                            if (isSync) {
                                ready = true
                                object = val
                                isError = false
                            } else {
                                next(val)
                            }
                        }, function (err) {
                            if (isSync) {
                                ready = true
                                object = err
                                isError = true
                            } else {
                                next(err, true)
                            }
                        })
                    } else {
                        value(function (err, val) {
                            if (isSync) {
                                if (err) {
                                    ready = true
                                    object = err
                                    isError = true
                                } else {
                                    ready = true
                                    object = val
                                    isError = false
                                }
                            } else {
                                if (err) {
                                    next(err, true)
                                } else {
                                    next(val)
                                }
                            }
                        })
                    }
                    isSync = false
                } catch (err) {
                    if (!ready) {
                        ready = true
                        object = err
                        isError = true
                    }
                }
                if (ready) { continue }
                return
            }

            throw new TypeError('Invalid type to yield')
        }
    }
}
exports.run = run
