
'use strict';

function assertType(bool, message, obj) {
    if (!bool) {
        throw new TypeError(message + (arguments.length <= 2
            ? '' : ', but the following was passed: "' + String(obj) + '"'))
    }
}
exports.assertType = assertType;


// exports.isReadable = function (obj) {
//     // return obj && obj.read && obj[$channel]
//     return obj && obj.read && obj._channel && obj._channel === obj._channel._channel
// };

// exports.isWritable = function (obj) {
//     //return obj && obj.write && obj[$channel]
//     return obj && obj.write && obj._channel && obj._channel === obj._channel._channel
// };


function isThenable(obj) {
    return obj && typeof obj.then === 'function'
}
exports.isThenable = isThenable;


//var genFunConstructor = (function* () {}).constructor;


function isGeneratorFunction(obj) {
    return obj && obj.constructor && obj.constructor.name === 'GeneratorFunction'
    //return obj && obj.constructor === genFunConstructor
}
exports.isGeneratorFunction = isGeneratorFunction;


exports.nextTick = process.nextTick;
                //(process && process.nextTick)
                //|| setImmediate
                //|| setTimeout;


// crash program !!!
// may use process.on('uncaughtException', listener)
// to prevent crash!
function panic(err) {
    if (arguments.length === 1) {
        process.nextTick(function () {
            throw err;
        })
    }
}
exports.panic = panic;


var commands = require('./built-in')

function coroutine (gen, cb) {
    var stack;

    return function next (object, isError) {
        var ref = {
            object: object,
            isError: isError
        };
        try {
            do {
                if (stack && ref.isError && ref.object instanceof Error) {
                    ref.object.stack += '\n-----------------------\n' + stack;
                }

                var result = gen[ref.isError ? 'throw' : 'next'](ref.object)
                var value = result.value;

                if (result.done) {
                    try { cb(null, value) } catch (e) { panic(e) }
                    return;
                }

                assertType(Array.isArray(value));

                // ['debug', info, ['wait', promise]]
                stack = null;
                var cmd;
                if (value[0] === 'debug') {
                    stack = value[1];
                    cmd = value[2];
                } else {
                    cmd = value;
                }

                // ['take', ch]
            } while (commands[cmd[0]](next, cmd, ref))

        } catch (e) {
            // attach stack to err
            try { cb(e) } catch (e) { panic(e) }
        }
    }
}
exports.coroutine = coroutine;
