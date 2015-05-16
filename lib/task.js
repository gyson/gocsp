'use strict';

var Promise = require('./promise')

// import { chan, xxx, abc, task }

// import task from 'gocsp/task'

import { task } from 'gocsp'

var t = task()

// { depends: { 'name': promise-resolved, 'name2': resolved} }
t.add('name', ['name', 'name2'], function (depends) {

})

t.add('name', function (depends) {

})

t.add('name', async function (depends) {
    return new Promise(function () {
        // ...
        // ...
    })
})

// csp.async(function* () {
//
// })

t.add('name', function* () {

})

// Promise.async

// t.wait('name').then(function () {
//
// })

'use strict';

module.exports = exports = Task

var go = require('./go')
var Future = require('./future')

function Task() {
    this._tasks = {}
}

// pass(function (val, cb) {
//
// }, function (err, cb) {
//
// })
// task.sync('name', depends, function (depends) {
//
// })
// err, cb
//
// val, cb
// val, cb
//
// cb()
// task.async('name', depends, function (cb, depends) {
//
// })
// if (ip('125.0.0.*'))
// var ip = ipp({
//     blacklist: ['xxx']
//     whitelist: ['xxx']
// })

// if (block(req)) {
//     return
// }
//
// task.go('name', depends, function* (depends) {
//
// })

// timeout(1000)
// timeout(1000, task.wait('name'), function (cb, future) {
//     // call this if timeout
//     throw new Error('timeout error')
// })

Task.prototype.add = function (name, depends, body) {
    if (arguments.length === 2) {
        if (typeof depends === 'function') {
            body = depends
            depends = []
        } else {
            // assert depends is array
            body = function (cb) { cb() }
        }
    }

    // add subtask
    // if this task is added
    if (this._tasks[name].state === ADD) {
        throw new Error('cannot add ' + name + ' multiple times')
    } else if (state === WIAT) {
        // add depends, add body
    } else {
        this._tasks[name] = new Subtaks(name, depends, body)
        this._tasks[name].state = ADD
    }

    return this
}

//
// Task.prototype.wait = function (name) {
//     if (!(this._tasks[name] instanceof T)) {
//         this._tasks[name] = new T(WAIT)
//     }
//     if (this._tasks[name].state === ADDED) {
//         start(this, name)
//     }
//     return this._tasks[name].result
// }
//

Task.prototype.wait = function (name) {
    var self = this
    return new Future(function (cb) {
        // if (!self._tasks[name]) {
            // self._tasks[name] = new Subtask(name)
            // self._tasks[name].state = WAIT
        // }
        self._tasks[name].future.done(cb)
        // self._tasks[name].start()
    })
}

var WAIT = 0
var ADD = 1
var OK = 2

function Subtask(name, depends, body) {
    this.name = name
    this.depends = depends
    this.body = body

    var self = this
    self.future = new Future(function (cb) {
        self.cb = cb
    })
}

// waited, added, started
Subtask.prototype.start = function () {

    this.state = START

    switch (depends.length) {
    case 0:
        return run()
    case 1:
        return this.wait(depends[0]).done(run)
    default:
        var self = this
        all(depends.map(function (name) {
            return self.wait(name)
        }))
        .done(run)
    }

    function run(err, val) {
        var cb = self._cbs[name]
        if (err) { return cb(err) }
        try {
            body(cb, val)
        } catch (e) {
            cb(e)
        }
    }
}

//
// function start(task, name) {
//     var t = task._tasks[name]
//
//     t.state = START
//
//     // check cycle dependency ?
//     var th
//     switch (t.depends.length) {
//     case 0:
//         th = THUNK_NOOP
//         break
//     case 1:
//         th = t.wait(t.depends[0])
//         break
//     default:
//         th = all(t.depends.map(function (name) {
//             return t.wait(name)
//         }))
//     }
//     th(function (err, val) {
//         if (err) {
//             // throw new ...
//             t.done(err)
//         } else {
//             pipe(t.body)(t.done)
//         }
//     })
// }
