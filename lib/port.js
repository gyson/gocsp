
'use strict';

var LinkList = require('./linklist');

module.exports = Port;

function Port () {
    this._closed = false;
    this._message = void 0;

    this._takers = new LinkList();
    this._senders = new LinkList();

    // Native Promise does not support inherits yet !!!
    this._promise = new Promise(function (resolve) {
        this._resolve = resolve;
    }.bind(this));
}
// require('util').inherits(Port, Promise);

Port.prototype.take = function () {
    var self = this;
    return new Promise(function (resolve) {
        self._take(resolve);
    });
}

Port.prototype.put = function (data) {
    var self = this;
    return new Promise(function (resolve) {
        self._put(data, resolve);
    });
}

Port.prototype.then = function (ifResolved) {
    return this._promise.then(ifResolved)
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
        });
    }
    while (!this._senders.isEmpty()) {
        this._senders.shift()(false);
    }
}

Port.prototype.isClosed = function () {
    return this._closed;
}

Port.prototype.getCloseMessage = function () {
    return this._message;
}


// internal usage, release zalgo!
Port.prototype._take = function (cb) {
    if (this._closed) {
        cb({ done: true, value: this._message });
        return;
    }
    if (this._senders.isEmpty()) {
        return this._takers.push(cb); // handle object
    } else {
        var sender = this._senders.shift();
        sender(true);
        cb({ done: false, value: sender.data });
    }
}

// internal usage, release zalgo!
Port.prototype._put = function (data, cb) {
    if (this._closed) {
        cb(false);
        return;
    }
    if (this._takers.isEmpty()) {
        cb.data = data;
        return this._senders.push(cb);
    } else {
        var taker = this._takers.shift();
        taker({ done: false, value: data });
        cb(true);
    }
}
