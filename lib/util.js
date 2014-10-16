
'use strict'

function isGenFun(obj) {
    return obj && obj.constructor && obj.constructor.name === 'GeneratorFunction'
}
exports.isGenFun = exports.isGeneratorFunction = isGenFun

// function isReadable(obj) {
//     return true // TODO
// }
// exports.isReadable = isReadable

function isWritable(obj) {
    return obj.write && obj.end // TODO
}
exports.isWritable = isWritable

function isGenerator(obj) {
    return Object.prototype.toString.call(obj) === '[object Generator]'
}
exports.isGenerator = isGenerator

function isThenable(obj) {
    return obj && typeof obj.then === 'function'
}
exports.isThenable = isThenable

// crash program !!!
// may use process.on('uncaughtException', listener)
// to prevent crash!
function panic(error) {
    setImmediate(function () {
        throw error
    })
}
exports.panic = panic

function noop () {}
exports.noop = noop
