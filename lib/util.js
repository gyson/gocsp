
'use strict'

function isGenFun(obj) {
    return obj && obj.constructor && obj.constructor.name === 'GeneratorFunction'
}
exports.isGenFun = exports.isGeneratorFunction = isGenFun

function isWritableStream(obj) {
    return obj.write && obj.end // TODO
}
exports.isWritableStream = isWritableStream

// crash program !!!
// may use process.on('uncaughtException', listener)
// to prevent crash!
function panic(error) {
    setImmediate(function () {
        throw error
    })
}
exports.panic = panic
