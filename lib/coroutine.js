
'use strict'

var Promise = require('./promise')
var panic = require('./util').panic
var isGenFun = require('./util').isGenFun
var isGenerator = require('./util').isGenerator

function async(genFun) {
    if (!isGenFun(genFun)) {
        throw new TypeError(genFun + ' must be generator function')
    }
    return function () {
        var gen = genFun.apply(this, arguments)
        return new Promise(function (resolve, reject) {
            run(gen, function (err, data) {
                if (arguments.length === 1) {
                    reject(err)
                } else {
                    resolve(data)
                }
            })
        })
    }
}
exports.async = async

function spawn(gen, cb) {
    if (isGenFun(gen)) {
        gen = gen()
    } else {
        if (!isGenerator(gen)) {
            throw new TypeError('Must be generator or generator function')
        }
    }
    run(gen, function (err, data) {
        setImmeidate(function () {
            (cb || throwIfError)(err, data)
        })
    })
}
exports.spawn = spawn

function throwIfError(err) {
    if (err) {
        throw err
    }
}

function run(gen, cb) {
    next()

    function next(object, isError) {
        try {
            execute(object, isError)
        } catch (err) {
            cb(err)
        }
    }

    function raise(error) { next(error, true) }

    function execute(object, isError) {
        var result, value
        for (;;) {
            result = isError ? gen.throw(object) : gen.next(object)
            value = result.value

            if (result.done) {
                cb(null, value)
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
