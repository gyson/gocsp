
'use strict';

/*
// state
//  0: pending
//  1: resolved
// -1: rejected
*/

var assertType = require('./util').assertType;

function Task (executeFn) {
    this._state = 0;
    this._value = void 0;
    this._listeners = [];

    setup(this, executeFn);
}

function setup (task, executeFn) {
    try {
        executeFn(
            function (obj) { resolveTask(task, obj) },
            function (obj) { rejectTask(task, obj)  },
            task);
    } catch (err) {
        rejectTask(task, err);
    }
}

function resolveTask (task, obj) {
    if (task._state === 0) {
        task._state = 1;
        task._value = obj;

        var listeners = task._listeners;
        task._listeners = null;

        for (var i = 0, len = listeners.length; i < len; i++) {
            listeners[i](obj, false);
        }
    }
}

function rejectTask (task, obj) {
    if (task._state === 0) {
        task._state = -1;
        task._value = obj;

        var listeners = task._listeners;
        task._listeners = null;

        for (var i = 0, len = listeners.length; i < len; i++) {
            listeners[i](obj, true);
        }
    }
}

Task.prototype.isPending = function () {
    return this._state === 0;
};

Task.prototype.isResolved = function () {
    return this._state === 1;
};

Task.prototype.isRejected = function () {
    return this._state === -1;
};

// Task.prototype.getValue = function () {
//     if (this._state !== 1) {
//         throw new Error('task is not resolved!');
//     }
//     return this._value;
// };

// Task.prototype.getError = function () {
//     if (this._state !== -1) {
//         throw new Error('task is not rejected!');
//     }
//     return this._value;
// };

// Task.prototype.defer = function (fn) {
//     if (this._state !== 0) {
//         throw new Error('task is not pending!');
//     }
//     this._listeners.push(fn)
// };

// if no argument, check if error, then panic

// data, isError
Task.prototype.done = function (fn) {
    var self = this;
    return new Task(function (resolve, reject) {
        if (self._state === 0) {
            self._listeners.push(next);
        } else {
            next(self._value, self._state === -1);
        }
        function next (data, isError) {
            // if (isGeneratorFunction(fn)) {
            //     async(fn)(isError ? data : null, isError ? null : data)
            //     .done(function (err, data) {
            //         err ? reject(err) : resolve(data);
            //     })
            // } else {
            if (typeof fn === 'undefined') {
                if (isError) {
                    // panic
                    setTimeout(function () {
                        // panic
                        throw data;
                    }, 0);
                    reject(data);
                } else {
                    resolve(data);
                }

            } else if (typeof fn === 'function') {
                try {
                    resolve(isError ? fn(data) : fn(null, data));
                } catch (err) {
                    reject(err)
                }
                (isError ? reject : resolve)(data);
            }


            //}
        }
    })
    // return spawn(fn)
};

// .done(function (err, data) {
//     if (err) throw err; // pass error to next level
//
//     // process data
//     yield ...;
//     return data;
// })
// .done(function () {
//     // finally
// })
// .done(function* () {
//     // ...
// })

// new Task(fs.readFile())
//     .timeout(1000)
//     .done(function (err, data) {
//         // if timeout, it's error
//         if (err && err.timeout) {
//             // handle exception, err.task, err.timeout true, err.time
//         } else {
//              // ...
//         }
//     })

Task.prototype.timeout = function (time) {
    var task = this;
    return new Task(function (resolve, reject) {
        if (task._state === 0) {
            task._listeners.push(next);
        } else {
            next(task._value, task._state === -1)
        }
        function next (value, isError) {
            (isError ? reject : resolve)(value);
        }
        setTimeout(function () {
            if (task._state === 0) {
                var err = new Error('Timeout!');
                err.timeout = true;
                err.task = task;
                err.time = time;
                reject(err);
            }
        }, time);
    });
    return this;
};

// Task.prototype.zalgo = function (fn) {
//     if (this._state === 0) {
//         this._listeners.push(next);
//         return false;
//     } else {
//         fn(this._value, this._state === -1);
//         return true;
//     }
// };

Task.prototype.toPromise = function () {
    return Task.promisify(this);
};

Task.prototype.toChannel = function () {
    var ch = new Channel();
    if (task._state === 0) {
        task._listeners.push(next);
    } else {
        next(task._value, task._state === -1);
    }
    function next (value, isError) {
        if (isError) {
            ch.close(value);
        } else {
            ch.write(value);
            ch.close();
        }
    }
    return ch;
};

Task.isTask = function (obj) {
    return obj._state === 0
        || obj._state === 1
        || obj._state === -1
};

Task.resolve = function (obj) {
    return new Task(function (resolve) {
        resolve(obj);
    });
};

Task.reject = function (obj) {
    return new Task(function (_, reject) {
        reject(obj);
    });
};

Task.race = function (tasks) {
    assertType(Array.isArray(tasks) && tasks.every(Task.isTask),
        'Task.race only accept an array of tasks', tasks);

    return new Task(function (resolve, reject, t) {
        var len = tasks.length;
        for (var i = 0; i < len; i++) {
            if (tasks[i]._state !== 0) {
                (tasks[i]._state === 1 ? resolve : reject)(tasks[i]._value);
                return;
            }
        }
        function next (obj, isError) {
            if (t._state === 0) {
                (isError ? reject : resolve)(obj);
            }
        }
        for (var i = 0; i < len; i++) {
            // push to tasks
            tasks[i]._listeners.push(next);
        }
    })
};

Task.all = function (tasks) {
    assertType(Array.isArray(tasks) && tasks.every(Task.isTask),
        'Task.all only accept an array of tasks', tasks);

    return new Task(function (resolve, reject, t) {

        var len = tasks.length;
        var result = new Array(len);
        var count = 0;

        if (len <= 0) {
            resolve([]);
            return;
        }

        tasks.forEach(function (task, index) {
            if (task._state === 0) {
                task._listeners.push(next);
            } else {
                next(task._value, task._state === -1);
            }
            //task.zalgo(next);
            function next (obj, isError) {
                if (t._state !== 0) return;

                if (isError) {
                    reject(obj);
                    result = null;
                    return;
                }

                result[index] = obj;
                count++;

                if (count === len) {
                    resolve(result);
                }
            }
        });
    });
};

//
// Task.catch(xyz(ldkfjsldf), function (err) {
//     // ...
// })

//
// Task.catch(Task.spawn(function* () {
//
// }), function (err) {
//
// })

// use for something like bluebird ?
Task.makePromisify = function (Promise) {
    return function (task) {
        return new Promise(function (resolve, reject) {
            if (task._state === 0) {
                task._listeners.push(function (value, isError) {
                    (isError ? reject : resolve)(value);
                });
            } else {
                (task._state === 1 ? resolve : reject)(task._value);
            }
            // task.zalgo(function (value, isError) {
            //     (isError ? reject : resolve)(value);
            // })
        });
    }
};

// native Promise by default
Task.promisify = Task.makePromisify(Promise);

Task.callback = function (task, cb) {
    if (task._state === 0) {
        task._listeners.push(function (value, isError) {
            isError ? cb(value) : cb(null, value);
        });
    } else {
        task._state === -1 ? cb(task._value) : cb(null, task._value);
    }
}

Task.sleep = function (time) {
    return new Task(function (resolve) {
        setTimeout(resolve, time);
    });
};

//Task.Task = Task;

exports.Task = Task;
