
'use strict'

module.exports = LinkList

function LinkList() {
    this.next = this
    this.prev = this
    this.length = 0
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
    item.list.length--
    item.next = null
    item.prev = null
    item.list = null
    return item.data
}
LinkList.remove = remove

LinkList.prototype.push = function (data) {
    var item = {
        list: this,
        data: data,
        next: this,
        prev: this.prev
    }
    this.prev.next = item
    this.prev = item
    this.length++
    return item
}

LinkList.prototype.isEmpty = function () {
  return this.length === 0
}
