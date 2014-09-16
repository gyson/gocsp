
'use strict';

var util = require('./util');
var LinkList = require('./linklist');

var isNumber = util.isNumber;

function sleep (next, args, ref) {
    var time = args[1];
    setTimeout(function () {
        next();
    }, time);
    return false;
}
exports.sleep = sleep;

/*
yield go('task', function (resolve, reject) {

}, timeout, function () {
    // handle timeout
})
*/
function task (next, args, ref) {
    var done = false;
    var resume = false;
    var executeFn = args[1];
    var isSync = true;

    function resolve(obj) {
        if (done) return;
        done = true;
        if (isSync) {
            ref.isError = false;
            ref.object = obj;
            resume = true;
        } else {
            next(obj, false);
        }
    }

    function reject(reason) {
        if (done) return;
        done = true;
        if (isSync) {
            ref.isError = true;
            ref.object = reason;
            resume = true;
        } else {
            next(reason, true);
        }
    }

    try {
        executeFn(resolve, reject);
    } catch (err) {
        reject(err);
    }
    isSync = false;
    return resume;
}
exports.task = task;

// go('await', promise, timeout, timeoutHandler)
function await (next, args, ref) {
    var done = false;
    var promise = args[2];

    if (isNumber(timeout)) {
        setTimeout(function () {
            if (done) return;
            next(new Error('timeout!'), true)
        }, timeout)
    } else {
        promise = timeout;
    }

    promise.then(next, function (reason) {
        next(reason, true);
    });
    return false;
}
exports.await = await;

// go('take', port, timeout, timeoutHandler)
function take (next, args, ref) {
    var resume = false;
    var isSync = true;
    var port = args[1]

    if (port._canTake()) {
        ref.isError = false;
        ref.object = port._doTake();
        return true;
    }
    port._cbTake(next);
    return false;
}
exports.take = take;

// go('put', data, port, [timeout, [timeoutHandler]])
function put (next, args, ref) {
    var resume = false;
    var isSync = true;
    var data = args[1];
    var port = args[2];

    if (port._canPut()) {
        ref.isError = false;
        ref.object = port._doPut(data);
        return true;
    }
    var done = false;
    var cb = function (x) {
        done = true;
        next(x, false);
    }
    port._cbPut(data, cb);

    // handle timeout cleanup
    // var timeout = args[3];
    // if (isNumber(timeout)) {
    //     setTimeout(function () {
    //         if (done) return;
    //         dll.remove(cb);
    //         if (args[4]) {
    //             try {
    //                 args[4]
    //             }
    //         } else {
    //             next(new Error('timeout!', true))
    //         }
    //     }, timeout)
    // }
    // may dll.remove(next)

    return false;
}
exports.put = put;

// select
// yield go('select',
//     ['take', ch, function () {
//
//     }],
//     ['put', ch, value, function () {
//
//     }],
//     ['timeout', 1000, function () {
//
//     }],
//     ['else', function () {
//
//     }]
// )

function tryCatch (ref, fn, data) {
    try {
        ref.object = (fn || noop)(data);
        ref.isError = false;
    } catch (err) {
        ref.object = err;
        ref.isError = true;
    }
}

function noop () {}

function select (next, args, ref) {

    // need to check no duplicate ports
    var ports = new WeakSet();

    // check if any port availbel or else condition
    for (var i = 1; i < args.length; i++) {
        var cmd = args[i];
        switch (cmd[0]) {
        case 'take':
            var port = cmd[1];

            if (ports.has(port)) {
                throw new Error('cannot have the same port in the select')
            }
            ports.add(port);

            if (port._canTake()) {
                tryCatch(ref, cmd[2], port._doTake());
                return true;
            }
            break;
        case 'put':
            var port = cmd[1];

            if (ports.has(port)) {
                throw new Error('cannot have the port')
            }
            ports.add(port);

            if (port._canPut()) {
                tryCatch(ref, cmd[3], port._doPut(cmd[2]));
                return true;
            }
            break;
        case 'timeout':
            // ignore
            break;
        case 'else':
            tryCatch(ref, cmd[1])
            return true;
        default:
            throw new Error('invalid command');
        }
    }

    var selected = false;
    var list = [];

    function cleanup (fn, data) {
        if (selected) return;
        selected = true;
        list.forEach(LinkList.remove);
        list = null;
        tryCatch(ref, fn, data);
    }

    args.slice(1).forEach(function (cmd) {
        // ['take', port, fn]
        switch (cmd[0]) {
        case 'take':
            var cb = function (result) {
                cleanup(cmd[2], result);
            }
            list.push(cb);
            cmd[1]._cbTake(cb);
            break;

        case 'put':
            var cb = function (result) {
                cleanup(cmd[3], result);
            }
            list.push(cb);
            cmd[1]._cbPut(cmd[2], cb);
            break;

        case 'timeout':
            setTimeout(function () {
                cleanup(cmd[2])
            }, cmd[1]);
            break;
        }
    })
}
exports.select = select;

// go('timeout', [command], 1000, function () {
//
// })
//
// go('timeout', ['take', port], 1000, function () {
//     // cannot get it!
// })
//
// go('timeout', ['select',
//     ['']
// ])
//
// go('await', promise, 1000, function () {
//     // timeout
//     throw new Error('timeout!')
// })
//
// yield go('thunk', cb => fs.readFile(...),
//     1000, function () {
//         // handle timeout!
//     })
//
// yield go('timeout', 1000, cb => fs.read)

// go('thunk', timeout, cb => fs.readFile(..., cb))
// throw exception if zalgo detected ?
function thunk (next, args, ref) {
    // cb only exec once
    // take care about sync call
    var done = true; // zalgo-safe
    var isSync = true;
    var resume = false

    function cb(err, data) {
        if (done) return;
        done = true;
        if (isSync) {
            resume = true;
            if (err) {
                ref.isError = true;
                ref.object = err;
            } else {
                ref.isError = false;
                ref.object = data;
            }
        } else {
            if (err) {
                next(err, true)
            } else {
                next(data, false);
            }
        }
    }
    try {
        args[1](cb);
    } catch (err) {
        cb(err);
    }
    isSync = false;

    // handle timeout


    return resume;
}
exports.thunk = thunk;
