
'use strict';

// link list
// based on https://github.com/joyent/node/blob/master/lib/_linklist.js

module.exports = LinkList;

function LinkList() {
    this._idleNext = this;
    this._idlePrev = this;
}

// remove the most idle item from the list
LinkList.prototype.shift = function () {
    var first = this._idlePrev;
    remove(first);
    return first;
}

// remove a item from its list
function remove(item) {
    if (item._idleNext) {
        item._idleNext._idlePrev = item._idlePrev;
    }

    if (item._idlePrev) {
        item._idlePrev._idleNext = item._idleNext;
    }

    item._idleNext = null;
    item._idlePrev = null;
}
LinkList.remove = remove;

// remove a item from its list and place at the end.
LinkList.prototype.push = function (item) {
    remove(item);
    item._idleNext = this._idleNext;
    this._idleNext._idlePrev = item;
    item._idlePrev = this;
    this._idleNext = item;
}

LinkList.prototype.isEmpty = function () {
  return this._idleNext === this;
}
