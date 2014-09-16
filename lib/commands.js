
'use strict';

var util = require('./util');
var LinkList = require('./linklist');

var isNumber = util.isNumber;

function sleep (self, args) {
    var time = args[1];
    setTimeout(function () {
        self.next();
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
function task(self, args) {
    var done = false;
    var isSync = true;
    var resume = false;

    function resolve(obj) {
        if (done) return;
        done = true;

        self.isError = false;
        self.object = obj;

        if (isSync) {
            resume = true;
        } else {
            self.next();
        }
    }

    function reject(reason) {
        if (done) return;
        done = true;

        self.isError = true;
        self.object = reason;

        if (isSync) {
            resume = true;
        } else {
            self.next();
        }
    }

    taskTryCatch(args[1], resolve, reject);
    isSync = false;

    return resume;
}
exports.task = task;

function taskTryCatch(fn, resolve, reject) {
    try {
        fn(resolve, reject);
    } catch (e) {
        reject(e);
    }
}


// go('await', promise, timeout, timeoutHandler)
function await (self, args) {
    //var done = false;
    var promise = args[1];

    // if (isNumber(timeout)) {
    //     setTimeout(function () {
    //         if (done) return;
    //         next(new Error('timeout!'), true)
    //     }, timeout)
    // } else {
    //     promise = timeout;
    // }

    promise.then(function (value) {
        // if (done) return;
        // done = true;

        self.isError = false;
        self.object = value;
        self.next();
    }, function (reason) {
        // if (done) return;
        // done = true;

        self.isError = true;
        self.object = reason;
        self.next();
    });
    return false;
}
exports.await = await;


// go('take', port, timeout, timeoutHandler)
function take (self, args) {
    var port = args[1]

    if (port._canTake()) {
        self.isError = false;
        self.object = port._doTake();
        return true;
    }
    port._cbTake(function (result) {
        self.isError = false;
        self.object = result;
        self.next();
    });
    return false;
}
exports.take = take;


// go('put', data, port, [timeout, [timeoutHandler]])
function put (self, args) {
    var data = args[1];
    var port = args[2];

    if (port._canPut()) {
        self.isError = false;
        self.object = port._doPut(data);
        return true;
    }
    port._cbPut(data, function (result) {
        self.isError = false;
        self.object = result;
        self.next();
    });

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

function noop () {}

function selectTryCatch (self, fn, data) {
    try {
        self.object = (fn || noop)(data);
        self.isError = false;
    } catch (err) {
        self.object = err;
        self.isError = true;
    }
}

function select(self, args) {

    // used for detect duplicate ports
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
                selectTryCatch(ref, cmd[2], port._doTake());
                return true;
            }
            break;

        case 'put':
            var port = cmd[1];

            if (ports.has(port)) {
                throw new Error('cannot have duplicated port')
            }
            ports.add(port);

            if (port._canPut()) {
                selectTryCatch(ref, cmd[3], port._doPut(cmd[2]));
                return true;
            }
            break;

        case 'timeout': // ignore now
            break;

        case 'else':
            selectTryCatch(ref, cmd[1])
            return true;
        default:
            throw new Error('invalid command: ' + cmd[0]);
        }
    }

    var selected = false;
    var list = [];

    function cleanup (fn, data) {
        if (selected) return;
        selected = true;
        list.forEach(LinkList.remove);
        list = null;
        selectTryCatch(ref, fn, data);
    }

    for (var i = 1; i < args.length; i++) {
        var cmd = args[i];
        selectHelper[cmd[0]](cmd, cleanup, list);
    }
}
exports.select = select;

var selectHelper = {
    take: function (cmd, cleanup, list) {
        var port = cmd[1], fn = cmd[2];
        var cb = function (result) {
            cleanup(fn, result);
        }
        list.push(cb);
        port._cbTake(cb);
    },
    put: function (cmd, cleanup, list) {
        var cb = function (result) {
            cleanup(cmd[3], result);
        }
        list.push(cb);
        cmd[1]._cbPut(cmd[2], cb);
    },
    timeout: function (cmd, cleanup) {
        setTimeout(function () {
            cleanup(cmd[2])
        }, cmd[1])
    }
};


function thunk(self, args) {
    // cb only exec once
    var done = true;
    var isSync = true; // zalgo-safe
    var resume = false

    function cb(err, data) {
        if (done) return;
        done = true;

        if (err) {
            self.isError = true;
            self.object = err;
        } else {
            self.isError = false;
            self.object = data;
        }

        if (isSync) {
            resume = true;
        } else {
            self.next();
        }
    }

    thunkTryCatch(args[0], cb);
    isSync = false;

    return resume;
}
exports.thunk = thunk;

function thunkTryCatch(fn, cb) {
    try {
        fn(cb);
    } catch (e) {
        cb(e);
    }
}
