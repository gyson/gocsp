
'use strict';

var util = require('./util');

var panic = util.panic;
var nextTick = util.nextTick;
var coroutine = util.coroutine;
var assertType = util.assertType;
var isGeneratorFunction = util.isGeneratorFunction;

module.exports = go;

function go () {
    return ['debug', new Error().stack, [].slice(arguments)]
}

function async (genFun) {
    assertType(isGeneratorFunction(genFun),
        'async function only accept a generator function', genFun);

    var task = taskify(genFun);
    return function () {
        return new Promise(task.apply(this, arguments));
    }
}
go.async = async;

function taskify (genFun) {
    assertType(isGeneratorFunction(genFun),
        'taskify function only accept a generator function', genFun);

    return function () {
        var gen = genFun.apply(this, arguments);

        return function (resolve, reject) {
            var next = coroutine(gen, function (err, data) {
                if (arguments.length === 1) {
                    reject(err)
                } else {
                    resolve(data)
                }
            });
            process.nextTick(next);
        }
    }
}
go.taskify = taskify;

function thunkify (genFun) {
    assertType(isGeneratorFunction(genFun),
        'thunkify function only accept a generator function', genFun);

    return function () {
        var gen = genFun.apply(this, arguments);
        return function (cb) {
            var next = coroutine(gen, cb);
            process.nextTick(next);
        }
    }
}
go.thunkify = thunkify;

function run (genFun, cb) {
    assertType(isGeneratorFunction(genFun),
        'async function only accept a generator function', genFun);

    var next = coroutine(genFun(), cb || panic)
    process.nextTick(next)
}
go.run = run;


// built-ins
