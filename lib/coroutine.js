
'use strict'

var readline = require('readline')
var Promise = require('./promise')
var isGenFun = require('./util').isGenFun
var isGenerator = require('./util').isGenerator

function async(genFun) {
    if (!isGenFun(genFun)) {
        throw new TypeError()
    }
    return function () {
        var gen = genFun.apply(this, arguments)
        return new Promise(function (resolve, reject) {
            run(gen, resolve, reject)
        })
    }
}
exports.async = async

function spawn(gen) {
    if (isGenFun(gen)) {
        gen = gen()
    }
    if (!isGenerator(gen)) {
        throw new TypeError()
    }
    return new Promise(function (resolve, reject) {
        run(gen, resolve, reject)
    })
}
exports.spawn = spawn

// run immediately
function run(gen, resolve, reject) {
    var done = false
    next()
    function next(obj, isError) {
        try {
            execute(obj, isError)
        } catch (err) {
            if (!done) {
                done = true
                reject(err)
            }
        }
    }
    function raise(error) { next(error, true) }

    function execute(obj, isError) {
        var result, value
        for (;;) {
            result = isError ? gen.throw(obj) : gen.next(obj)
            value = result.value;

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
                // thunk
                if (value.length === 1) {
                    new Promise(function (resolve, reject) {
                        value(function (err, data) {
                            err ? reject(err) : resolve(data)
                        })
                    }).then(next, raise)
                    return
                }
                // task
                if (value.length === 2) {
                    // task
                    new Promise(value).then(next, raise)
                    return
                }
            }

            // yield "What's your name?"
            // for shell script
            if (typeof value === 'string') {
                var rl = readline.createInterface({
                    input: process.stdin,
                    output: process.stdout
                })
                rl.question(value, function(answer) {
                    rl.close()
                    next(answer)
                })
                return
            }
            throw new TypeError('Invalid type to yield')
        }
    }
}
exports.run = run

var readline = require('readline');
