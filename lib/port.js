
'use strict';

var LinkList = require('./linklist');

function Port () {
    this._closed = false;
    this._message = void 0;

    this._takers = new LinkList(); // check performance with [] !!!
    this._senders = new LinkList();

    var self = this;
    Promise.call(this, function (resolve) {
        self._resolve = resolve;
    });
}
require('util').inherits(Port, Promise);

Port.prototype.take = function () {
    var self = this;
    return new Promise(function (resolve) {
        if (self._canTake()) {
            resolve(self._doTake());
        } else {
            self._cbTake(resolve);
        }
    })
}

Port.prototype.put = function (data) {
    var self = this;
    return new Promise(function (resolve) {
        if (self._canPut()) {
            resolve(self._doPut(data));
        } else {
            self._cbPut(data, resolve);
        }
    })
}

Port.prototype.close = function (message) {
    if (this._closed) return;
    this._closed = true;
    this._message = message;

    this._resolve(message);

    while (!this._takers.isEmpty()) {
        this._takers.shift()({
            done: true,
            value: message
        })
    }
    while (!this._senders.isEmpty()) {
        this._senders.shift()(false)
    }
}

Port.prototype._canTake = function () {
    return this._closed || !this._senders.isEmpty();
}

Port.prototype._doTake = function () {
    if (this._closed) {
        return { done: true, value: this._message }
    } else {
        var sender = this._senders.shift();
        sender(true);
        return { done: false, value: sender.data };
    }
}

Port.prototype._cbTake = function (cb) {
    this._takers.push(cb);
}

Port.prototype._canPut = function () {
    return this._closed || !this._takers.isEmpty();
}

Port.prototype._doPut = function (data) {
    if (this._closed) {
        return false;
    } else {
        var taker = this._takers.shift();
        taker(data);
        return true;
    }
}

Port.prototype._cbPut = function (data, cb) {
    cb.data = data;
    this._senders.push(cb);
}
