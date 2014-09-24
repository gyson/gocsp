
'use strict';

module.exports = Task;

function Task(co) {
    this.co = co;
    this.done = false;
    this.isSync = true;
    this.resume = false;
}

Task.prototype.resolve = function (value) {
    if (this.done) return;
    this.done = true;

    this.co.object = value;
    this.co.isError = false;

    if (this.isSync) {
        this.resume = true;
    } else {
        this.co.next();
    }
}

Task.prototype.reject = function (reason) {
    if (this.done) return;
    this.done = true;

    this.co.object = reason;
    this.co.isError = true;

    if (this.isSync) {
        this.resume = true;
    } else {
        this.co.next();
    }
}

Task.prototype.timeout = function (time, handler) {
    if (!time) return;

    var self = this;
    setTimeout(function () {
        if (self.done) return;
        self.done = true;
        try {
            self.co.object = (handler || throwTimeoutError)();
            self.co.isError = false;
            self.co.next();
        } catch (err) {
            self.co.object = err;
            self.co.isError = true;
            self.co.next();
        }
    }, time)
}

function throwTimeoutError() {
    throw new Error('timeout!');
}
