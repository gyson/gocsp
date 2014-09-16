
'use strict';

var commands = require('./commands');

module.exports = Coroutine;

function Coroutine(gen, cb) {
    this.isError = false;
    this.object = void 0;
    this.stack = '';
    this.gen = gen;
    this.cb = cb || panic;
}

Coroutine.prototype.nextTick = function () {
    var self = this;
    process.nextTick(function () {
        self.next();
    });
}

Coroutine.prototype.next = function () {
    try {
        _next(this);
    } catch (e) {
        this.callback(e);
    }
}

function _next(self) {
    var result, value;
    do {
        result = self.isError
               ? self.gen.throw(self.object)
               : self.gen.next(self.object);

        value = result.value;

        if (result.done) {
            self.callback(null, value);
            return;
        }
    } while (_nextTryCatch(self, value));
}

function _nextTryCatch(self, value) {
    var resume;
    try {
        resume = commands[value[0]](self, value);
    } catch (err) {
        self.isError = true;
        self.object = err;
        resume = true;
    }
    return resume;
}

Coroutine.prototype.callback = function (err, data) {
    try {
        var cb = this.cb;
        if (arguments.length === 1) {
            cb(err);
        } else {
            cb(err, data);
        }
    } catch (e) {
        panic(e);
    }
}

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
