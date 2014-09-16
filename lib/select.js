
'use strict';

// Usage:
//
// yield go.select(s => s
//     .read(ch, function (data) {
//        // data.done, data.value
//     })
//     .write(ch, value, function (result) {
//
//     })
//     .else(function () {
//
//     })
// })
//
// yield go.select(s =>
//     s.read(ch, data => dosomething)
//     ||
//     s.write(ch, value, result => dosomething)
//     ||
//     s.timeout(2000, () => console.log('tiemout!'))
// )
//
// self.chClose = new Channel();
//
// this.chClose.close()
//
// this.chError.close('something')

var dll  = require('./dll');
var util = require('./util');
var Task = require('./task').Task;

var assertType = util.assertType;
var isReadable = util.isReadable;
var isWritable = util.isWritable;
var isGeneratorFunction = util.isGeneratorFunction;


function noop() {}

go.select = function (fn) {
    return new Selector(fn);
};


function Selector (fn) {
    this._map = new Map();
    this._selected = false;

    // check if everything ok

    // var self = this;
    // Task.call(this, function (resolve, reject) {
    //     self._resolve = resolve;
    //     self._reject  = reject;
    //     if (fn) { fn(self) }
    // });
}

// require('util').inherits(Selector, Promise);

Selector.prototype.take = function (ch, fn) {
    var self = this;

    if (self._selected) return;

    if (self._map.has(ch)) {
        throw new Error('Cannot select a channel multiple times');
    }

    function cb (result) {
        execute(self, fn, result);
    }
    self._map.set(port, cb);

    port._take(cb)
};

Selector.prototype.put = function (port, data, fn) {
    var self = this;

    if (self._selected) return;

    if (this._map.has(port)) {
        throw new Error('Cannot select a channel multiple times');
    }

    var self = this;
    function cb (result) {
        execute(self, fn, result);
    }
    self._map.set(port, cb);

    port._put(data, cb)
};

Selector.prototype.timeout = function (time, fn) {
    if (this._selected) return;

    var self = this;
    setTimeout(function () {
        if (!self._selected) {
            execute(self, fn);
        }
    }, time);
};

Selector.prototype.else = function (fn) {
    if (!this._selected) {
        execute(this, fn);
    }
};

function execute (self, fn, data) {
    self._selected = true;

    self._map.forEach(function (cb, port) {
        dll.remove(
            port[cb.hasOwnProperty('data')
            ? '_senders' : '_takers'], cb);
    });
    self._map.clear();

    // cb
    tryCatch(fn, data, cb);

    // if (isGeneratorFunction(fn)) {
    //     var g = go(fn)(data);
    //     if (g.isPending()) {
    //         g._listeners.push(function (value, isError) {
    //             (isError ? reject : resolve)(value);
    //         })
    //         return;
    //     } else {
    //         g._state === 1
    //             ? resolve(g._value)
    //             : reject(g._value);
    //     }
    // } else {

    //}

}

// make it a little bit faster by isolate try...catch
function tryCatch (fn, data, cb) {
    try {
        cb(null, fn(data));
    } catch (err) {
        cb(err);
    }
}
