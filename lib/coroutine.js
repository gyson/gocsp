
'use strict';

var commands = require('./commands');

module.exports = Coroutine;

function Coroutine(gen, cb) {
    this.isError = false;
    this.object = void 0;
    this.stack = ''; // TODO: long stack trace !
    this.gen = gen;
    this.cb = cb || panic;
}

Coroutine.prototype.next = function () {
    var result, value;
    for (;;) {
        try {
            result = this.isError
                   ? this.gen.throw(this.object)
                   : this.gen.next(this.object);
            value = result.value;
        } catch (e) {
            this.callback(e)
            return;
        }
        if (result.done) {
            this.callback(null, value);
            return;
        }
        try {
            if (!commands[value[0]](this, value)) {
                return
            }
        } catch (err) {
            this.isError = true;
            this.object = err;
        }
    }
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
