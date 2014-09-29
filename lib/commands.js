
'use strict';

var Task = require('./task');
var LinkList = require('./linklist');

// ['debug', stack, [...]]
function debug(co, args) {
    return exports[args[2][0]](co, args[2])
}
exports.debug = debug

function sleep (co, args) {
    var time = args[1];
    setTimeout(function () {
        // ...
        co.next();
    }, time);
    return false;
}
exports.sleep = sleep;


function defer(co, args) {
    setImmediate(function () {
        // ...
        co.next();
    });
    return false;
}
exports.defer = defer;


function nextTick(co, args) {
    process.nextTick(function () {
        co.isError = false;
        co.object = null;
        co.next();
    });
    return false;
}
exports.nextTick = nextTick;


// yield go('once', event, type, ...)
// yield go('once', ws, 'open', 'error')

// yield go('select'
//     ['once', event, 'close'],
//     ['once', event, 'error'])
// once
// ? yield go('once', [ws, 'open', 'error'], [e2, 't1', 't2']) ?
function once(co, args) {
    var event = args[1];

    var list = [];
    function cleanup() {
        if (!list) return;
        list.forEach(function (obj) {
            event.removeListener(obj.type, obj.callback)
        })
        list = null;
    }
    for (var i = 2; i < args.length; i++) {
        var type = args[i]
        var callback = function (data) {
            cleanup()
            co.isError = false;
            co.object = data;
            co.next()
        }
        list.push({ type: type, callback: callback })
        event.on(type, callback)
    }
    return false;
}
exports.once = once;

/*
yield go('task', function (resolve, reject) {

}, timeout, function () {
    // handle timeout
})
*/
function task(co, args) {
    var t = new Task(co);

    var execute = args[1];
    var timeout = args[2];
    var handler = args[3];

    try {
        execute(function (value) {
            t.resolve(value);
        }, function (reason) {
            t.reject(reason);
        })
    } catch (err) {
        t.reject(err);
    }
    t.isSync = false;

    if (!t.done && timeout) {
        t.timeout(timeout, handler);
    }
    return t.resume;
}
exports.task = task;


function thunk(co, args) {
    var t = new Task(co);

    var execute = args[1];
    var timeout = args[2];
    var handler = args[3];

    try {
        execute(function (err, data) {
            if (err) {
                t.reject(err);
            } else {
                t.resolve(data);
            }
        });
    } catch (err) {
        t.reject(err);
    }
    t.isSync = false;

    if (!t.done && timeout) {
        t.timeout(timeout, handler);
    }
    return t.resume;
}
exports.thunk = thunk;


// go('await', promise, timeout, timeoutHandler)
function await (co, args) {
    var t = new Task(co);
    t.isSync = false;

    var promise = args[1];
    var timeout = args[2];
    var handler = args[3];

    promise.then(function (value) {
        t.resolve(value);
    }, function (reason) {
        t.reject(reason);
    });

    if (timeout) {
        t.timeout(timeout, handler);
    }
    return false;
}
exports.await = await;


// go('take', port, timeout, timeoutHandler)
function take (co, args) {
    var port    = args[1];
    // var timeout = args[2];
    // var handler = args[3];

    port = port.output || port;

    var t = new Task(co);

    var cb = function (result) {
        t.resolve(result);
    }
    port._take(cb);
    t.isSync = false;

    // if (timeout != null) {
    //     t.timeout(timeout, function () {
    //         LinkList.remove(cb);
    //         return handler();
    //     });
    // }
    return t.resume;
}
exports.take = take;


// go('put', port, data, timeout, timeoutHandler)
function put (co, args) {
    var port    = args[1];
    var data    = args[2];
    // var timeout = args[3];
    // var handler = args[4];

    port = port.input || port;

    var t = new Task(co);
    var cb = function (result) {
        t.resolve(result);
    };
    port._put(data, cb);
    t.isSync = false;

    // if (timeout != null) {
    //     t.timeout(timeout, function () {
    //         LinkList.remove(cb);
    //         return handler();
    //     });
    // }
    return t.resume;
}
exports.put = put;

// select
// support 'once' ?

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

// ?? support 'once' ??
//     ['once', ws, 'close', function () {
//
//     }],
//     ['once', ws, 'error', function () {
//
//     }],

//     ['else', function () {
//
//     }]
// )

// which one come first ?2
// select(
//     ['await', promise1],
//     ['await', promise2],
//     ['await', promise3],
//     ['timeout', 100, function () {
//         // handle timeout
//     }]
// )
//
// select(function(){
//     this
//     .await()
// })

// go.put(chan, value)
// go.take(chan, value) // return promise ?
// go.select() // return promise

// yield go 'select', ->
//   @await promise1
//   @await promise2
//   @await promise3
//   @timeout 1000, ->
//     // handle timeout!
// for one time notification
// select(s => s
//     .once()
//     .once()
//     .once()
// )


// go('once', event, 'close')
// go('parallel', ...)
// go('await', promise/thenable)

// go('take', ch)
// go('put', ch)

function noop () {}

function select(co, args) {

    // used for detect duplicate ports
    var ports = new WeakSet();
    var callbacks = [];
    var t = new Task(co);

    function cleanup (handler, data) {
        if (!callbacks) return;
        callbacks.forEach(LinkList.remove);
        callbacks = null;
        ports = null;
        try {
            t.resolve((handler || noop)(data));
        } catch (e) {
            t.reject(e);
        }
    }

    var commands = [].slice.call(args, 1);

    commands.forEach(function (cmd) {
        if (t.done) return;

        switch (cmd[0]) {

        // ['take', port, fn]
        case 'take':
            var port    = cmd[1];
            var handler = cmd[2];

            // check if it's channel
            port = port.output || port;

            if (ports.has(port)) {
                t.reject(new Error('cannot have duplicated port'));
                cleanup();
                return;
            }
            ports.add(port);

            var item = port._take(function (result) {
                cleanup(handler, result)
            })
            if (item) {
                callbacks.push(item);
            }
            break;

        // ['put', data, port, handler]
        case 'put':
            var port    = cmd[1];
            var data    = cmd[2];
            var handler = cmd[3];

            // check if it's Channel
            port = port.input || port;

            if (ports.has(port)) {
                t.reject(new Error('cannot have duplicated port'));
                cleanup();
                return;
            }
            ports.add(port);

            var item = port._put(data, function (result) {
                cleanup(handler, result);
            });
            if (item) {
                callbacks.push(item);
            }
            break;

        // ['timeout', 1000, handler]
        case 'timeout':
            var time    = cmd[1];
            var handler = cmd[2];

            t.timeout(timeout, function () {
                cleanup(handler)
            });
            break;

        // ['else', handler]
        case 'else':
            var handler = cmd[1];

            cleanup(handler);
            break;

        default:
            t.reject(new Error('invalid command: ' + cmd[0]));
            cleanup();
        }
    });
    t.isSync = false;

    return t.resume;
}
exports.select = select;
