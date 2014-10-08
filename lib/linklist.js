
'use strict'

module.exports = LinkList

function LinkList() {
    this.next = this
    this.prev = this
}

LinkList.prototype.shift = function () {
    if (this.isEmpty()) {
        throw new Error('Cannot shift from empty list')
    }
    return remove(this.next)
}

function remove(item) {
    item.next.prev = item.prev
    item.prev.next = item.next
    item.next = null
    item.prev = null
    return item.data
}
LinkList.remove = remove

LinkList.prototype.push = function (data) {
    var item = {
        data: data,
        next: this,
        prev: this.prev
    }
    this.prev.next = item
    this.prev = item
    return item
}

LinkList.prototype.isEmpty = function () {
  return this.prev === this
}
