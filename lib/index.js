
'use strict';

var Coroutine = require('./coroutine');

exports = module.exports = go;

exports.fs = require('./fs');
exports.Port = require('./port');
exports.Channel = require('./channel');
exports.Coroutine = require('./coroutine');

function go () {
    // if debuge
    return ['debug', new Error().stack, arguments]
    // else return arguments
}

function async (genFun) {
    if (!isGenFun(genFun)) {
        throw new TypeError();
    }
    var task = taskify(genFun);
    return function () {
        return new Promise(task.apply(this, arguments));
    }
}
exports.async = async;

function taskify (genFun) {
    if (!isGenFun(genFun)) {
        throw new TypeError();
    }
    return function () {
        var gen = genFun.apply(this, arguments);

        var called = false;
        return function (resolve, reject) {
            if (called) {
                throw new Error('can only call it once!');
            }
            called = true;

            process.nextTick(function () {
                new Coroutine(gen, function (err, data) {
                    if (arguments.length === 1) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                }).next();
            })
        }
    }
}
exports.taskify = taskify;

function thunkify (genFun) {
    if (!isGenFun(genFun)) {
        throw new TypeError();
    }
    return function () {
        var gen = genFun.apply(this, arguments);
        var called = false;
        return function (cb) {
            if (called) {
                throw new Error('can only call it once!');
            }
            called = true;
            process.nextTick(function () {
                new Coroutine(gen, cb).next();
            })
        }
    }
}
exports.thunkify = thunkify;

function spawn(genFun, cb) {
    if (!isGenFun(genFun)) {
        throw new TypeError();
    }
    thunkify(genFun)()(cb);
}
exports.spawn = spawn;

// run it immediately
function run(genFun, cb) {
    if (!isGenFun(genFun)) {
        throw new TypeError();
    }
    new Coroutine(genFun(), cb).next()
}
exports.run = run;

var genFunConstructor = (function* () {}).constructor;

function isGenFun(obj) {
    return obj && obj.constructor === genFunConstructor
}
