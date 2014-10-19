
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
    next()

    function next(object, isError) {
        try {
            execute(object, isError)
        } catch (err) {
            reject(err)
        }
    }

    function raise(error) { next(error, true) }

    function execute(object, isError) {
        var result, value
        for (;;) {
            result = gen[isError ? 'throw' : 'next'](object)
            value = result.value

            if (result.done) {
                resolve(value)
                return
            }

            // it's promise
            if (value && typeof value.then === 'function') {
                value.then(next, raise)
                return
            }

            if (typeof value === 'function') {
                if (callFunction(value)) { continue }
                return
            }

            throw new TypeError('Invalid type to yield')
        }

        // ES6: proper tail call ?
        function callFunction(value) {
            var called = false
            var isSync = true
            try {
                if (value.length === 2) {
                    value(function (val) {
                        if (called) { return }
                        called = true

                        if (isSync) {
                            object = val
                            isError = false
                        } else {
                            next(val)
                        }
                    }, function (err) {
                        if (called) { return }
                        called = true

                        if (isSync) {
                            object = err
                            isError = true
                        } else {
                            raise(err)
                        }
                    })
                } else {
                    value(function (err, val) {
                        if (called) { return }
                        called = true

                        if (isSync) {
                            if (err) {
                                object = err
                                isError = true
                            } else {
                                object = val
                                isError = false
                            }
                        } else {
                            if (err) {
                                raise(err)
                            } else {
                                next(val)
                            }
                        }
                    })
                }
                isSync = false
            } catch (err) {
                if (!called) {
                    called = true
                    object = err
                    isError = true
                }
            }
            return called
        }
    }
}
exports.run = run
